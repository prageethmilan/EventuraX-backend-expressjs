const {STATUS_500, STATUS_400, STATUS_200} = require('../const/const');
const bcrypt = require('bcryptjs');
const Vendor = require('../models/vendor.models');

const saveVendor = async (req, resp) => {
    try {
        const {firstName, lastName, email, password} = req.body;

        if (!firstName || !lastName || !email || !password) {
            return resp.status(400).json(STATUS_400('All fields are required', false));
        }

        const existingVendor = await Vendor.findOne({email});

        if (existingVendor && existingVendor.socialId !== null) {
            return resp.status(200).json(STATUS_200('User already sign up for system using this email via social media signup', false));
        } else if (existingVendor && existingVendor.socialId === null) {
            return resp.status(200).json(STATUS_200('Email already exists', false))
        }

        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) {
                return resp.status(500).json(STATUS_500);
            }

            const vendor = new Vendor({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword, // Store social ID as password (not used for login)
                googleId: null,
                facebookId: null,
                twitterId: null,
                socialId: null
            });

            try {
                const result = await vendor.save();
                resp.status(200).json(STATUS_200('Vendor signup successfully', true));  // Send response with the saved vendor data
            } catch (error) {
                console.error(error);
                resp.status(500).json(STATUS_500);
            }
        });
    } catch (e) {
        console.error(e);
        resp.status(500).json(STATUS_500);
    }
};

const updatePassword = async (req, resp) => {
    try {
        const {vendorId, currentPassword, newPassword} = req.body;

        if (!vendorId || !currentPassword || !newPassword) {
            return resp.status(400).json(STATUS_400("All fields are required", false));
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return resp.status(400).json(STATUS_400("Vendor not found!", false));
        }

        if (vendor.socialId !== null) {
            return resp.status(400).json(STATUS_400("Cannot update password for social media signup", false));
        }

        const isMatch = await bcrypt.compare(currentPassword, vendor.password);
        if (!isMatch) {
            return resp.status(400).json(STATUS_400("Current password is incorrect", false));
        }

        const salt = await bcrypt.genSalt(10);
        vendor.password = await bcrypt.hash(newPassword, salt);
        await vendor.save();

        resp.status(200).json(STAddUS_200("Password updated successfully", true));
    } catch (error) {
        console.error(error);
        resp.status(500).json(STATUS_500);
    }
};

module.exports = {
    saveVendor,
    updatePassword
}