const express = require('express')
const router = express.Router()
const upload = require("../middleware/uploadMiddleware")

const advertisementController = require('../controller/advertisementController')
const paymentController = require("../controller/paymentController");

router.post('/add', upload.array("images", 7), advertisementController.saveAdvertisement)
router.post('/payment', paymentController.processPayment)

module.exports = router