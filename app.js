const express = require('express')
const dotenv = require("dotenv");
const cors = require('cors')
const connectToDB = require("./config/db");
const authRoutes = require('./route/auth')
const vendorRoutes = require('./route/vendor')
const BASE_PATH = '/api/v1'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.options('*', cors())
const PORT = process.env.PORT || 4000;

connectToDB()

const server = app.listen(PORT, () => {
    console.log(`App starting on ${PORT}`)
})

app.get(`${BASE_PATH}`, (req, res) => {
    console.log("Hello World")
})

app.use(`${BASE_PATH}/auth`, authRoutes)
app.use(`${BASE_PATH}/vendor`, vendorRoutes)

module.exports = {app, server}
