const mongoose = require('mongoose')

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
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        googleId: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // Allows multiple null values
        },
        facebookId: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // Allows multiple null values
        },
    }, {timestamps: true}
);

module.exports = mongoose.model('Vendor', vendorScheme)