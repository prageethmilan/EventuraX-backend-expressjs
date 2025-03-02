const express = require('express')
const router = express.Router()

const vendorController = require('../controller/vendorController')

router.post('/sign-up', vendorController.saveVendor)
router.post('/update-password', vendorController.updatePassword)
router.get('/:vendorId', vendorController.getVendorDetails)

module.exports = router