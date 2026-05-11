import puppeteer from "puppeteer";

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

export async function resolveStreams(type, tmdbId, season, episode) {
  const browser = await getBrowser();
  try {
    const sources = [];
    const baseId = tmdbId;
    const mediaType = type === "movie" ? "movie" : "tv";

    const embedSites = [
      {
        name: "vidsrc",
        label: "VidSrc",
        url: season
          ? `https://vidsrc.in/embed/${mediaType}/${baseId}/${season}/${episode}`
          : `https://vidsrc.in/embed/${mediaType}/${baseId}`,
        priority: 20,
      },
      {
        name: "embed_su",
        label: "Embed.su",
        url: season
          ? `https://embed.su/embed/${mediaType}/${baseId}/${season}/${episode}`
          : `https://embed.su/embed/${mediaType}/${baseId}`,
        priority: 25,
      },
      {
        name: "multiembed",
        label: "MultiEmbed",
        url: `https://multiembed.mov/directstream.php?video_id=${baseId}&tmdb=1`,
        priority: 30,
      },
      {
        name: "2embed",
        label: "2Embed",
        url: `https://2embed.org/embed/${baseId}`,
        priority: 35,
      },
    ];

    for (const site of embedSites) {
      sources.push({
        server: site.name,
        label: site.label,
        url: site.url,
        type: "iframe",
        priority: site.priority,
      });
    }

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

    const m3u8Urls = new Set();

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes(".m3u8")) {
        m3u8Urls.add(url);
        request.abort();
      } else {
        request.continue();
      }
    });

    const targetUrl = season
      ? `https://vidsrc.in/embed/${mediaType}/${baseId}/${season}/${episode}`
      : `https://vidsrc.in/embed/${mediaType}/${baseId}`;

    try {
      await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 10000 });
      await new Promise(r => setTimeout(r, 2000));
    } catch {}

    if (m3u8Urls.size) {
      [...m3u8Urls].forEach((url, i) => {
        sources.push({
          server: "vidsrc",
          label: i === 0 ? "السيرفر الرئيسي — VidSrc" : `VidSrc — بديل ${i + 1}`,
          url,
          type: "m3u8",
          priority: i === 0 ? 1 : 2 + i,
        });
      });
    }

    return sources;
  } finally {
    await browser.close();
  }
}
