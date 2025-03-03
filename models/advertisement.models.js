const mongoose = require("mongoose");
const Categories = require("../enums/categories");


const advertisementSchema = new mongoose.Schema({
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
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
            required: false,
            default: 0
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "COMPLETED"],
            default: "PENDING"
        }
    }, {timestamps: true}
);

module.exports = mongoose.model('Advertisement', advertisementSchema)