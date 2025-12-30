require("dotenv").config()
const axios = require("axios")
const puppeteer = require("puppeteer")
const Article = require("../backend/src/models/Article")
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGO_URI)

const OPENAI = new (require("openai"))({ apiKey: process.env.OPENAI_KEY })

const scrapeContent = async url => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "domcontentloaded" })
  const content = await page.evaluate(() => document.body.innerText)
  await browser.close()
  return content
}

const run = async () => {
  const articles = await Article.find({ isUpdated: false })

  for (const article of articles) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`https://www.google.com/search?q=${article.title}`)

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a")).map(a => a.href)
    )

    const filtered = links.filter(l => l.includes("http")).slice(0, 2)
    const contents = []

    for (const link of filtered) {
      contents.push(await scrapeContent(link))
    }

    const prompt = `
Rewrite this article using style and structure of below references.

Original:
${article.content}

References:
${contents.join("\n")}
`

    const completion = await OPENAI.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })

    await Article.findByIdAndUpdate(article._id, {
      content: completion.choices[0].message.content,
      isUpdated: true,
      references: filtered
    })

    await browser.close()
  }

  process.exit()
}

run()
