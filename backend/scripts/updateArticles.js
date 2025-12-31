require("dotenv").config()

const axios = require("axios")
const puppeteer = require("puppeteer")
const Groq = require("groq-sdk")

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const API_BASE = "http://localhost:5000/api/articles"

const scrapeMainContent = async (url) => {
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 })

  const content = await page.evaluate(() => {
    const article = document.querySelector("article")
    return article ? article.innerText : document.body.innerText
  })

  await browser.close()
  return content
}

const getGoogleLinks = async (title) => {
  const browser = await puppeteer.launch({ headless: "new" })
  const page = await browser.newPage()

  await page.goto(
    `https://www.google.com/search?q=${encodeURIComponent(title)}`,
    { waitUntil: "domcontentloaded", timeout: 0 }
  )

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a"))
      .map(a => a.href)
      .filter(h =>
        h.startsWith("http") &&
        !h.includes("google.com") &&
        !h.includes("youtube.com") &&
        !h.includes("/search?")
      )
  )

  await browser.close()
  return links.slice(0, 2)
}

const run = async () => {
  const { data: articles } = await axios.get(API_BASE)

  for (const article of articles) {
    if (article.isUpdated) continue

    const refs = await getGoogleLinks(article.title)
    if (refs.length < 2) continue

    const refContents = []
    for (const r of refs) {
      refContents.push(await scrapeMainContent(r))
    }

    const prompt = `
Rewrite the article below.
Match tone, structure, and formatting of reference articles.
Use headings and short paragraphs.
Do not copy text.

Original:
${article.content}

References:
${refContents.join("\n\n")}
`

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }]
    })

    const updatedContent = `
${completion.choices[0].message.content}

---

References:
${refs.map(r => `- ${r}`).join("\n")}
`

    await axios.put(`${API_BASE}/${article._id}`, {
      content: updatedContent,
      isUpdated: true,
      references: refs
    })
  }

  process.exit()
}

run()
