const express = require('express')
const router = express.Router()

const vendorController = require('../controller/vendorController')

router.post('/login', vendorController.saveVendor)

module.exports = router