require("dotenv").config()
const mongoose = require("mongoose")
const app = require("./src/app")

mongoose.connect(process.env.MONGO_URI)
app.listen(process.env.PORT)
