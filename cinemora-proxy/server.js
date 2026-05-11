const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5555;
const EMBED_TEMPLATES = [
  (id, type) => `https://vidsrc.in/embed/${type}/${id}`,
  (id, type) => `https://embed.su/embed/${type}/${id}`,
  (id) => `https://2embed.org/embed/${id}`,
  (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
];

async function extractM3u8(page, url, timeout = 15000) {
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout });
    const m3u8 = await page.evaluate(() => {
      const videos = document.querySelectorAll("video source");
      for (const v of videos) {
        if (v.src && v.src.includes(".m3u8")) return v.src;
      }
      if (document.querySelector("video")?.src?.includes(".m3u8"))
        return document.querySelector("video").src;
      return null;
    });
    if (m3u8) return m3u8;
    const requests = [];
    page.on("request", (req) => {
      if (req.url().includes(".m3u8")) requests.push(req.url());
    });
    await new Promise((r) => setTimeout(r, 3000));
    return requests[0] || null;
  } catch {
    return null;
  }
}

app.post("/api/sources", async (req, res) => {
  const { type, id, season, episode } = req.body;
  const mediaType = type === "movie" ? "movie" : "tv";
  const results = [];

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: "C:\\Users\\Administrator\\.cache\\puppeteer\\chrome\\win64-148.0.7778.97\\chrome-win64\\chrome.exe",
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
    );

    for (const template of EMBED_TEMPLATES) {
      const url = template(id, mediaType);
      const m3u8 = await extractM3u8(page, url);
      if (m3u8) results.push({ name: `Source ${results.length + 1}`, url: m3u8 });
    }
  } catch (err) {
    console.error("Puppeteer error:", err);
  } finally {
    if (browser) await browser.close();
  }

  res.json({ sources: results });
});

app.listen(PORT, () => {
  console.log(`Cinemora proxy running on port ${PORT}`);
});
