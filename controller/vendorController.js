const {STATUS_500, STATUS_400, STATUS_200} = require('../const/const');
const bcrypt = require('bcryptjs');
const Vendor = require('../models/vendor.models');

const saveVendor = async (req, resp) => {
    try {
        const {firstName, lastName, email, password} = req.body;

        if (!firstName || !lastName || !email || !password) {
            return resp.status(400).json(STATUS_400('All fields are required'));
        }

        const existingVendor = await Vendor.findOne({email});

        if (existingVendor) {
            return resp.status(400).json(STATUS_400('Email already exists'));
        }

        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if (err) {
                return resp.status(500).json(STATUS_500);
            }

            const vendor = new Vendor({
                firstName,
                lastName,
                email,
                password: hashedPassword,  // Store the hashed password
            });

            try {
                const result = await vendor.save();
                resp.status(200).json(STATUS_200(null));  // Send response with the saved vendor data
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

module.exports = {
    saveVendor
}