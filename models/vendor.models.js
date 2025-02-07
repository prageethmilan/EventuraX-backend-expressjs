const mongoose = require('mongoose')
const Districts = require("../enums/districts");

const vendorScheme = new mongoose.Schema({
        firstName: {
            type: String,
            required: false
        },
        lastName: {
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
        },
        facebookId: {
            type: String,
            required: false,
            // unique: true,
            sparse: true, // Allows multiple null values
        },
        twitterId: {
            type: String,
            required: false,
            // unique: true,
            sparse: true, // Allows multiple null values
        },
        socialId: {
            type: String,
            required: false,
            // unique: true
        },
        location: {
            type: String,
            enum: Object.values(Districts),
            required: false
        }
    }, {timestamps: true}
);

module.exports = mongoose.model('Vendor', vendorScheme)