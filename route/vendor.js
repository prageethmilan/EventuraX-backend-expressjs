const express = require('express')
const router = express.Router()

const vendorController = require('../controller/vendorController')

router.post('/sign-up', vendorController.saveVendor)

module.exports = router