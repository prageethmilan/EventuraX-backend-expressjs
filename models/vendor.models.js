const mongoose = require(mongoose)

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

    }, {timestamps: true}
);

module.exports = mongoose.model('Vendor', vendorScheme)