const axios = require("axios")
const cheerio = require("cheerio")

async function run() {
  const { data } = await axios.get("https://beyondchats.com/blogs/")
  const $ = cheerio.load(data)

  const links = []

  $("a").each((_, el) => {
    const href = $(el).attr("href")
    if (href && href.includes("/blogs/")) {
      links.push(href)
    }
  })

  console.log("TOTAL /blogs/ LINKS FOUND:", links.length)
  console.log("LAST 15 LINKS:")
  console.log(links.slice(-15))
}

run()
