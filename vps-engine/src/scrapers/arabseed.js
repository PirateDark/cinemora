import puppeteer from "puppeteer";

const ARABSEED_BASE = "https://arabseed.ink";

async function getBrowser() {
  return puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
}

export async function scrapeArabSeed(type, tmdbId, season, episode) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

    await page.goto(`${ARABSEED_BASE}/?s=${tmdbId}`, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    const searchResults = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll("article, .post, .movie-item, .search-item").forEach(el => {
        const link = el.querySelector("a[href*='arabseed']");
        const title = el.querySelector(".title, h2, h3, .entry-title");
        if (link && title) {
          items.push({ url: link.href, title: title.textContent.trim() });
        }
      });
      return items;
    });

    if (!searchResults.length) return [];

    const mediaUrl = searchResults[0].url;
    await page.goto(mediaUrl, { waitUntil: "networkidle2", timeout: 15000 });
    const pageContent = await page.content();

    const sources = [];

    const watchRegex = /<a[^>]+href="([^"]+)"[^>]*>[\s]*<i[^>]*class="[^"]*fa-play[^"]*"[^>]*>[\s]*<\/i>[\s]*مشاهدة[\s]*<\/a>/i;
    const watchMatch = pageContent.match(watchRegex);
    if (watchMatch) {
      sources.push({
        server: "arabseed",
        label: "أراب سيد — مشاهدة مباشرة",
        url: watchMatch[1].startsWith("http") ? watchMatch[1] : `${ARABSEED_BASE}${watchMatch[1]}`,
        type: "embed",
        priority: 5,
      });
    }

    const iframeSrcs = pageContent.match(/<iframe[^>]+src="([^"]+)"[^>]*>/gi) || [];
    for (const iframe of iframeSrcs) {
      const src = iframe.match(/src="([^"]+)"/)?.[1];
      if (src && !src.includes("google") && !src.includes("facebook")) {
        sources.push({
          server: "arabseed",
          label: "مشغل أراب سيد",
          url: src,
          type: "iframe",
          priority: 8,
        });
      }
    }

    const videoSrcs = pageContent.match(/<source[^>]+src="([^"]+\.(?:mp4|m3u8)[^"]*)"[^>]*>/gi) || [];
    for (const video of videoSrcs) {
      const src = video.match(/src="([^"]+)"/)?.[1];
      if (src) {
        sources.push({
          server: "arabseed",
          label: "رابط مباشر — أراب سيد",
          url: src,
          type: src.includes(".m3u8") ? "m3u8" : "mp4",
          priority: 3,
        });
      }
    }

    return sources;
  } finally {
    await browser.close();
  }
}

export async function searchArabSeed(query) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    await page.goto(`${ARABSEED_BASE}/?s=${encodeURIComponent(query)}`, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    const results = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll("article, .post, .movie-item").forEach(el => {
        const link = el.querySelector("a[href*='arabseed']");
        const title = el.querySelector(".title, h2, h3, .entry-title");
        if (link && title) {
          items.push({ url: link.href, title: title.textContent.trim() });
        }
      });
      return items.slice(0, 10);
    });

    return results;
  } finally {
    await browser.close();
  }
}
