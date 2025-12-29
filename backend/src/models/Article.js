const mongoose = require("mongoose")

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  sourceUrl: String,
  isUpdated: Boolean,
  references: [String],
  createdAt: Date
})

module.exports = mongoose.model("Article", articleSchema)
