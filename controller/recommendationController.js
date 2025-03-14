const {exec, spawn} = require("child_process");
const Review = require("../models/review.models");
const Vendor = require("../models/vendor.models");
const Advertisement = require("../models/advertisement.models");
const path = require('path')
const {STATUS_500, STATUS_400, STATUS_200_WITH_DATA} = require("../const/const");

const getRecommendedAdvertisements = async (req, res) => {
    try {
        const {
            location,
            category
        } = req.query;

        const filter = {paymentStatus: "COMPLETED"};

        if (category) {
            filter.category = category;
        }

        const reviews = await Review.find();

        const vendorData = reviews.map(review => ({
            vendorId: review.vendorId.toString(),
            rating: review.rating,
            reviewText: review.reviewText
        }));

        const pythonScript = path.join(__dirname, "../ai_model/get_top_vendors.py");
        const pythonProcess = spawn("python3", [pythonScript]);

        let responseData = "";

        pythonProcess.stdin.write(JSON.stringify(vendorData));
        pythonProcess.stdin.end();

        let headersSent = false;

        pythonProcess.stdout.on("data", (data) => {
            responseData += data.toString();
        });

        pythonProcess.stdout.on("end", async () => {
            if (headersSent) return;
            try {
                const parsedData = JSON.parse(responseData);

                if (!Array.isArray(parsedData) || parsedData.length === 0) {
                    headersSent = true;
                    return res.status(200).json(STATUS_400("No top vendors found", false));
                }

                let topVendors = parsedData.slice(0, 2);
                let topVendorIds = topVendors.map(v => v.vendorId);

                if (location) {
                    const vendors = await Vendor.find({
                        _id: {$in: topVendorIds},
                        location: {$regex: `^${location}$`, $options: "i"}
                    });

                    topVendorIds = vendors.map(v => v._id.toString());

                    topVendors = topVendors.filter(v => topVendorIds.includes(v.vendorId));
                }

                if (topVendorIds.length === 0) {
                    headersSent = true;
                    return res.status(200).json(STATUS_400("No top vendors found for location", false));
                }

                const advertisements = [];
                for (const vendorId of topVendorIds) {
                    const ad = await Advertisement.findOne({
                        vendorId,
                        ...filter
                    })
                        .populate("vendorId")
                        .sort({createdAt: -1})
                        .limit(1);
                    if (ad) advertisements.push(ad)
                }

                const formattedAds = await Promise.all(
                    advertisements.map(async (ad) => {
                        const reviews = await Review.find({vendorId: ad.vendorId._id});
                        const totalReviews = reviews.length;
                        const averageRating = totalReviews
                            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                            : 0;

                        return {
                            _id: ad._id,
                            title: ad.title,
                            description: ad.description,
                            category: ad.category,
                            isLimitedTimeOffer: ad.isLimitedTimeOffer,
                            offerStartDate: ad.offerStartDate,
                            offerEndDate: ad.offerEndDate,
                            images: ad.images,
                            price: ad.price,
                            createdAt: ad.createdAt,
                            vendorId: ad.vendorId._id,
                            vendorName: ad.vendorId.name,
                            logo: ad.vendorId.logo,
                            address: ad.vendorId.address,
                            mobileNumber: ad.vendorId.mobileNumber,
                            email: ad.vendorId.email,
                            website: ad.vendorId.website,
                            averageRating: Number(averageRating.toFixed(1)),
                            totalReviews
                        };
                    })
                );

                const response = {
                    advertisements: formattedAds
                };

                headersSent = true;
                return res.status(200).json(STATUS_200_WITH_DATA(response, true, "Operation Successfully"));

            } catch (error) {
                console.error("❌ Error parsing AI model response:", error);
                if (!headersSent) {
                    headersSent = true;
                    return res.status(500).json(STATUS_500);
                }
            }
        });

        pythonProcess.stderr.on("data", (error) => {
            if (!headersSent) {
                headersSent = true;
                return res.status(500).json(STATUS_500);
            }
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        if (!res.headersSent) {
            return res.status(500).json(STATUS_500);
        }
    }
};

module.exports = {getRecommendedAdvertisements};
