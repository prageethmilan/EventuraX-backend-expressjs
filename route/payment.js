const express = require('express')
const router = express.Router()

const paymentController = require('../controller/paymentController')

router.post('/payment', paymentController.processPayment)

module.exports = router