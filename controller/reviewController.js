const Review = require("../models/review.models");
const Vendor = require("../models/vendor.models");
const {STATUS_500, STATUS_400, STATUS_200_WITH_DATA} = require("../const/const");

const saveReview = async (req, res) => {
    try {
        const {vendorId, userName, userEmail, reviewText, rating} = req.body;

        if (!vendorId || !userName || !userEmail || !reviewText || !rating) {
            return res.status(400).json(STATUS_400("All fields are required", false));
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json(STATUS_400("Vendor not found", false));
        }

        const review = new Review({
            vendorId,
            userName,
            userEmail,
            reviewText,
            rating
        });

        const savedReview = await review.save();

        res.status(200).json(STATUS_200_WITH_DATA(savedReview, true, "Review added successfully"));

    } catch (error) {
        console.error(error);
        res.status(500).json(STATUS_500("Server error", false));
    }
};

const getAllReviews = async (req, res) => {
    try {
        const {vendorId} = req.params;

        if (!vendorId) {
            return res.status(400).json(STATUS_400("Vendor ID is required", false));
        }

        const reviews = await Review.find({vendorId}).sort({createdDate: -1});

        res.status(200).json(STATUS_200_WITH_DATA(reviews, true, "Reviews fetched successfully"));
    } catch (error) {
        console.error(error);
        res.status(500).json(STATUS_500("Server error", false));
    }
};

module.exports = {
    saveReview,
    getAllReviews
};
