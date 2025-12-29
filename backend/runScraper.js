require("dotenv").config()
const mongoose = require("mongoose")
const scrape = require("./src/scrapers/beyondChatsScraper")

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await scrape()
  process.exit()
})
