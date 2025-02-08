const mongoose = require("mongoose");
const Categories = require("../enums/categories");


const advertisementSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        keywords: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: Object.values(Categories),
            required: true
        },
        isLimitedTimeOffer: {
            type: Boolean,
            required: true,
            default: false
        },
        offerStartDate: {
            type: Date,
            required: false,
            default: null
        },
        offerEndDate: {
            type: Date,
            required: false,
            default: null
        },
        images: [
            {type: String}
        ],
        price: {
            type: Number,
            required: false
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "COMPLETED"],
            default: "PENDING"
        }
    }, {timestamps: true}
);

module.exports = mongoose.model('Advertisement', advertisementSchema)