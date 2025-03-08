const Advertisement = require("../models/advertisement.models");
const Vendor = require("../models/vendor.models");
const Review = require('../models/review.models')
const {STATUS_500, STATUS_400, STATUS_200_WITH_DATA} = require("../const/const");

const saveAdvertisement = async (req, res) => {
    try {
        const {
            vendorId,
            title,
            description,
            category,
            isLimitedTimeOffer,
            offerStartDate,
            offerEndDate,
            price
        } = req.body;


        if (!vendorId || !title || !category) {
            return res.status(400).json(STATUS_400("Vendor ID, Title, and Category are required", false));
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json(STATUS_400("Vendor not found", false));
        }

        const serverUrl = `${req.protocol}://${req.get("host")}`;
        const images = req.files ? req.files.map(file => `${serverUrl}/uploads/${file.filename}`) : [];

        const advertisement = new Advertisement({
            vendorId,
            title,
            description: description || "",
            category,
            isLimitedTimeOffer: isLimitedTimeOffer === 1,
            offerStartDate: isLimitedTimeOffer === 1 ? new Date(offerStartDate) : null,
            offerEndDate: isLimitedTimeOffer === 1 ? new Date(offerEndDate) : null,
            images,
            price: price || 0,
            paymentStatus: "PENDING"
        });

        const savedAd = await advertisement.save();

        const responseData = {
            vendor: {
                name: vendor.name,
                email: vendor.email,
                mobileNumber: vendor.mobileNumber
            },
            advertisement: savedAd
        };

        res.status(200).json(STATUS_200_WITH_DATA(responseData, true, "Advertisement saved successfully"));

    } catch (error) {
        console.error(error);
        res.status(500).json(STATUS_500);
    }
};

const getAllCompletedAdvertisementsByVendor = async (req, res) => {
    try {
        const {vendorId} = req.params;
        const {paymentStatus, page, limit} = req.query;

        if (!vendorId) {
            return res.status(400).json(STATUS_400('Vendor ID is required', false));
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json(STATUS_400("Vendor not found", false));
        }

        const filter = {vendorId};
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus.toUpperCase();
        }

        const skip = (page - 1) * limit;

        const advertisements = await Advertisement.find(filter)
            .sort({createdAt: -1})
            .skip(skip)
            .limit(Number(limit))
            .lean();

        const reviews = await Review.find({vendorId});
        const totalReviews = reviews.length;
        const averageRating = totalReviews
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        const totalAdvertisements = await Advertisement.countDocuments(filter);

        const responseData = {
            advertisements: advertisements.map(ad => ({
                _id: ad._id,
                title: ad.title,
                description: ad.description,
                category: ad.category,
                isLimitedTimeOffer: ad.isLimitedTimeOffer,
                offerStartDate: ad.offerStartDate || null,
                offerEndDate: ad.offerEndDate || null,
                images: ad.images || [],
                price: ad.price,
                createdAt: ad.createdAt,
                vendorId: vendor._id,
                vendorName: vendor.name,
                logo: vendor.logo || null,
                address: vendor.address,
                mobileNumber: vendor.mobileNumber,
                email: vendor.email,
                website: vendor.website,
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews
            })),
            currentPage: Number(page),
            totalPages: Math.ceil(totalAdvertisements / limit)
        };

        res.status(200).json(STATUS_200_WITH_DATA(responseData, true, 'Operation Successfully'));
    } catch (error) {
        console.error("❌ Error fetching advertisements:", error);
        res.status(500).json(STATUS_500);
    }
};

module.exports = {
    saveAdvertisement,
    getAllCompletedAdvertisementsByVendor
};
