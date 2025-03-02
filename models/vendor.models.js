const mongoose = require('mongoose')
const Districts = require("../enums/districts");

const vendorSchema = new mongoose.Schema({
        name: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false,
            // unique: true
        },
        password: {
            type: String,
            required: false
        },
        googleId: {
            type: String,
            required: false,
            // unique: true,
            sparse: true, // Allows multiple null values
            default: null
        },
        facebookId: {
            type: String,
            required: false,
            // unique: true,
            sparse: true, // Allows multiple null values
            default: null
        },
        twitterId: {
            type: String,
            required: false,
            // unique: true,
            sparse: true, // Allows multiple null values,
            default: null
        },
        socialId: {
            type: String,
            required: false,
            default: null
            // unique: true
        },
        location: {
            type: String,
            enum: Object.values(Districts),
            required: false,
            default: null
        },
        description: {
            type: String,
            required: false,
            default: null
        },
        mobileNumber: {
            type: String,
            required: false,
            default: null
        },
        website: {
            type: String,
            required: false,
            default: null
        },
        logo: {type: String, default: null}
    }, {timestamps: true}
);

module.exports = mongoose.model('Vendor', vendorSchema)