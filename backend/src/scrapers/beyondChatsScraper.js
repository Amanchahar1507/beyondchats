const axios = require("axios")
const cheerio = require("cheerio")
const Article = require("../models/Article")

module.exports = async () => {
  const { data } = await axios.get("https://beyondchats.com/blogs/")
  const $ = cheerio.load(data)

  const links = []
  $(".blog-card a").each((i, el) => {
    links.push($(el).attr("href"))
  })

  const oldest = links.slice(-5)

  for (const link of oldest) {
    const page = await axios.get(link)
    const $$ = cheerio.load(page.data)

    const title = $$("h1").text()
    const content = $$("article").text()

    await Article.create({
      title,
      content,
      sourceUrl: link,
      isUpdated: false,
      references: [],
      createdAt: new Date()
    })
  }
}
