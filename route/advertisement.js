const express = require('express')
const router = express.Router()
const upload = require("../middleware/uploadMiddleware")

const advertisementController = require('../controller/advertisementController')
const paymentController = require("../controller/paymentController");
const recommendationController = require("../controller/recommendationController");

router.post('/add', upload.array("images", 10), advertisementController.saveAdvertisement)
router.post('/payment', paymentController.processPayment)
router.put('/payment/verify', paymentController.verifyPayment)
router.get("/recommended-ads", recommendationController.getRecommendedAdvertisements);
router.get("/getAllAds/:vendorId", advertisementController.getAllCompletedAdvertisementsByVendor)
router.get('/getAllAdsForDashboard/:vendorId', advertisementController.getAllAdvertisementsForVendor)
router.put('/update/:advertisementId', upload.array("images", 10), advertisementController.updateAdvertisement)
router.delete('/:advertisementId', advertisementController.deleteAdvertisement)

module.exports = router