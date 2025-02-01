const express = require('express')
const {authValidation} = require('../validation/auth')
const {STATUS_400} = require('../const/const')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Vendor = require('../models/vendor.models')

const login = async (req, resp) => {

    const {email, password} = req.body

    try {
        const validate = authValidation(req.body)

        if (validate?.message) {
            resp.status(400).json(STATUS_400(validate.message))
        } else {
            const vendor = await Vendor.findOne({email})

            if (!vendor) {
                return resp.status(200).json({message: 'Vendor not found'})
            }

            const isMatch = await bcrypt.compare(password, Vendor.password);

            if (!isMatch) {
                return resp.status(400).json(STATUS_400('Invalid Password'));
            }

            const jwtSecretKey = process.env.JWT_SECRET_KEY;

            const payload = {
                id: vendor._id,
                email: vendor.email,
                name: vendor.firstName + ' ' + vendor.lastName
            };

            const token = jwt.sign(payload, jwtSecretKey, {expiresIn: '24h'});
            return resp.status(200).json({
                message: 'Login successful',
                access_token: token,
                vendor: payload
            });
        }
    } catch (e) {
        console.error(e);
        return resp.status(500).json({message: 'Server error'});
    }
}

module.exports = {login}