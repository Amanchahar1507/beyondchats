const puppeteer = require("puppeteer")
const Article = require("../models/Article")

module.exports = async () => {
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()

  await page.goto("https://beyondchats.com/blogs/", {
    waitUntil: "networkidle2",
    timeout: 0
  })

  const blogLinks = await page.evaluate(() => {
    const links = []
    document.querySelectorAll("a").forEach(a => {
      const href = a.href
      if (
        href &&
        href.startsWith("https://beyondchats.com/blogs/") &&
        !href.includes("/tag/") &&
        href.split("/").length > 4
      ) {
        links.push(href)
      }
    })
    return [...new Set(links)]
  })

  const oldestFive = blogLinks.slice(-5)

  let inserted = 0

  for (const link of oldestFive) {
    const articlePage = await browser.newPage()
    await articlePage.goto(link, {
      waitUntil: "networkidle2",
      timeout: 0
    })

    const data = await articlePage.evaluate(() => {
      const title =
        document.querySelector("h1")?.innerText ||
        document.querySelector("h2")?.innerText ||
        ""

      let content = ""
      const possibleContainers = [
        "main",
        "section",
        "div"
      ]

      for (const selector of possibleContainers) {
        const el = document.querySelector(selector)
        if (el && el.innerText.length > 500) {
          content = el.innerText
          break
        }
      }

      return { title, content }
    })

    if (!data.title || data.content.length < 500) {
      await articlePage.close()
      continue
    }

    await Article.create({
      title: data.title,
      content: data.content,
      sourceUrl: link,
      isUpdated: false,
      references: [],
      createdAt: new Date()
    })

    inserted++
    await articlePage.close()
  }

  console.log("Total articles inserted:", inserted)
  await browser.close()
}
