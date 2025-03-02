const express = require('express')
const {authValidation} = require('../validation/auth')
const {STATUS_400} = require('../const/const')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Vendor = require('../models/vendor.models')

const login = async (req, resp) => {

    const {email, password} = req.body
    try {
        const vendor = await Vendor.findOne({email})
        if (!vendor) {
            return resp.status(200).json({message: 'Vendor not found'})
        }

        const isMatch = await bcrypt.compare(password, vendor.password);

        if (!isMatch) {
            return resp.status(400).json(STATUS_400('Invalid Password'));
        }

        const jwtSecretKey = process.env.JWT_SECRET_KEY;

        const payload = {
            id: vendor._id,
            email: vendor.email,
            name: vendor.name,
            isVerified: vendor.verified
        };

        const token = jwt.sign(payload, jwtSecretKey, {expiresIn: '30d'});
        return resp.status(200).json({
            message: 'Login successful',
            access_token: token,
            vendor: payload,
            success: true
        });
    } catch (e) {
        console.error(e);
        return resp.status(500).json({message: 'Server error'});
    }
}

const socialLogin = async (req, res) => {
    try {
        const {email, name, googleId, facebookId, twitterId, socialId} = req.body;

        let vendor = await Vendor.findOne({socialId});
        if (!vendor) {
            vendor = new Vendor({
                name: name,
                email: email,
                password: googleId || facebookId, // Store social ID as password (not used for login)
                googleId: googleId || null,
                facebookId: facebookId || null,
                twitterId: twitterId || null,
                socialId
            });

            await vendor.save();
        }

        const token = jwt.sign(
            {
                id: vendor._id,
                email: vendor.email,
                name: vendor.name,
                socialId: vendor.socialId,
                isVerified: vendor.verified
            },
            process.env.JWT_SECRET_KEY,
            {expiresIn: '30d'}
        );

        res.status(200).json({message: 'Login successful', access_token: token, vendor, success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
}

module.exports = {login, socialLogin}