import puppeteer from "puppeteer";

const AKWAM_BASE = "https://ak.sv";

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

export async function scrapeAkwam(type, tmdbId, season, episode) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

    let searchQuery;
    if (type === "movie") {
      searchQuery = `${AKWAM_BASE}/?s=${tmdbId}`;
    } else {
      searchQuery = `${AKWAM_BASE}/?s=${tmdbId}&type=series`;
    }

    await page.goto(searchQuery, { waitUntil: "networkidle2", timeout: 15000 });
    const pageContent = await page.content();

    const sources = [];

    if (pageContent.includes("watch")) {
      const watchLinks = pageContent.match(/<a[^>]+href="([^"]+watch[^"]+)"[^>]*>/gi) || [];
      for (const link of watchLinks.slice(0, 3)) {
        const href = link.match(/href="([^"]+)"/)?.[1];
        if (href) {
          const fullUrl = href.startsWith("http") ? href : `${AKWAM_BASE}${href}`;
          sources.push({
            server: "akwam",
            label: type === "movie" ? "أكوام" : `أكوام — الموسم ${season || 1}`,
            url: fullUrl,
            type: "embed",
            priority: 10,
          });
        }
      }
    }

    const iframeSrcs = pageContent.match(/<iframe[^>]+src="([^"]+)"[^>]*>/gi) || [];
    for (const iframe of iframeSrcs) {
      const src = iframe.match(/src="([^"]+)"/)?.[1];
      if (src && !src.includes("google") && !src.includes("facebook")) {
        sources.push({
          server: "akwam",
          label: "مشغل أكوام",
          url: src,
          type: "iframe",
          priority: 15,
        });
      }
    }

    return sources;
  } finally {
    await browser.close();
  }
}

export async function searchAkwam(query) {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    await page.goto(`${AKWAM_BASE}/?s=${encodeURIComponent(query)}`, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    const results = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll("article, .post, .movie-item").forEach(el => {
        const link = el.querySelector("a");
        const title = el.querySelector(".title, h2, h3");
        if (link && title) {
          items.push({
            url: link.href,
            title: title.textContent.trim(),
          });
        }
      });
      return items.slice(0, 10);
    });

    return results;
  } finally {
    await browser.close();
  }
}
