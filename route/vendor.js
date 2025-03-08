const express = require('express')
const router = express.Router()
const upload = require("../middleware/uploadMiddleware")

const vendorController = require('../controller/vendorController')
const reviewController = require('../controller/reviewController')

router.post('/sign-up', vendorController.saveVendor)
router.post('/update-password', vendorController.updatePassword)
router.get('/:vendorId', vendorController.getVendorDetails)
router.put('/:vendorId', vendorController.updateVendor)
router.put('/:vendorId/upload-logo', upload.single("logo"), vendorController.updateVendorLogo);
router.post('/add-review', reviewController.saveReview)
router.get('/reviews/:vendorId', reviewController.getAllReviews)
router.get('/user-profile/:vendorId', vendorController.getVendorDetailsForUserProfile)

module.exports = router