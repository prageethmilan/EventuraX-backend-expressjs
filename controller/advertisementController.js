const Advertisement = require("../models/advertisement.models");
const Vendor = require("../models/vendor.models");
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
        res.status(500).json(STATUS_500("Server error", false));
    }
};

module.exports = {saveAdvertisement};
