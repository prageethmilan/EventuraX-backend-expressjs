const express = require('express')
const dotenv = require("dotenv");
const cors = require('cors')
const connectToDB = require("./config/db");

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

