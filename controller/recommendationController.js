const {exec, spawn} = require("child_process");
const Review = require("../models/review.models");
const Advertisement = require("../models/advertisement.models");
const path = require('path')
const {STATUS_500, STATUS_400, STATUS_200_WITH_DATA} = require("../const/const");

const getRecommendedAdvertisements = async (req, res) => {
    try {
        const reviews = await Review.find();

        const vendorData = reviews.map(review => ({
            vendorId: review.vendorId.toString(),
            rating: review.rating,
            reviewText: review.reviewText
        }));

        const pythonScript = path.join(__dirname, "../ai_model/get_top_vendors.py");
        const pythonProcess = spawn("python3", [pythonScript]);

        pythonProcess.stdin.write(JSON.stringify(vendorData));
        pythonProcess.stdin.end();

        let responseData = "";
        let headersSent = false;

        pythonProcess.stdout.on("data", (data) => {
            responseData += data.toString();
        });

        pythonProcess.stdout.on("end", async () => {
            if (headersSent) return;
            try {
                const parsedData = JSON.parse(responseData);

                if (!Array.isArray(parsedData)) {
                    headersSent = true;
                    return res.status(500).json(STATUS_500({message: "Invalid AI Model Response", success: false}));
                }

                if (parsedData.length === 0) {
                    headersSent = true;
                    return res.status(404).json(STATUS_400({message: "No top vendors found", success: false}));
                }

                const topVendors = parsedData.slice(0, 2);
                const vendorIds = topVendors.map(v => v.vendorId);

                const advertisements = []
                for (const vendorId of vendorIds) {
                    const ad = await Advertisement.findOne({vendorId})
                        .sort({createdAt: -1})
                        .limit(1);
                    if (ad) advertisements.push(ad);
                }

                headersSent = true;
                return res.status(200).json(STATUS_200_WITH_DATA({
                    vendors: topVendors,
                    advertisements
                }, true, 'Operation Successfully'));
            } catch (error) {
                if (!headersSent) {
                    headersSent = true;
                    return res.status(500).json(STATUS_500({message: "AI Model Response Error", success: false}));
                }
            }
        });

        pythonProcess.stderr.on("data", (error) => {
            if (!headersSent) {
                headersSent = true;
                return res.status(500).json(STATUS_500({message: "AI Model Error", success: false}));
            }
        });

    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json(STATUS_500({message: "Internal Server Error", success: false}));
        }
    }
};

module.exports = {getRecommendedAdvertisements};
