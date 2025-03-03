const express = require('express')
const router = express.Router()
const upload = require("../middleware/uploadMiddleware")

const advertisementController = require('../controller/advertisementController')

router.post('/add', upload.array("images", 7), advertisementController.saveAdvertisement)

module.exports = router