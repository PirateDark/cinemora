import { Router } from "express";
import { scrapeAkwam } from "../scrapers/akwam.js";
import { scrapeArabSeed } from "../scrapers/arabseed.js";
import { resolveStreams } from "../scrapers/resolvers.js";
import prisma from "../lib/prisma.js";
import { getCached, setCache } from "../lib/redis.js";

const router = Router();

router.post("/sources", async (req, res) => {
  try {
    const { type, id, season, episode } = req.body;
    if (!type || !id) {
      return res.status(400).json({ success: false, error: "نوع ومعرف المحتوى مطلوبان" });
    }

    const cacheKey = `sources:${type}:${id}:${season || ""}:${episode || ""}`;
    const cached = await getCached(cacheKey, 600);
    if (cached) return res.json({ success: true, sources: cached });

    const results = [];
    const errors = [];

    const akwamPromise = scrapeAkwam(type, id, season, episode)
      .then(sources => { if (sources.length) results.push(...sources); })
      .catch(err => errors.push(`Akwam: ${err.message}`));

    const arabseedPromise = scrapeArabSeed(type, id, season, episode)
      .then(sources => { if (sources.length) results.push(...sources); })
      .catch(err => errors.push(`ArabSeed: ${err.message}`));

    const resolverPromise = resolveStreams(type, id, season, episode)
      .then(sources => { if (sources.length) results.push(...sources); })
      .catch(err => errors.push(`Resolver: ${err.message}`));

    await Promise.allSettled([akwamPromise, arabseedPromise, resolverPromise]);

    if (!results.length) {
      return res.status(404).json({
        success: false,
        error: "لم يتم العثور على مصادر",
        errors,
      });
    }

    const sorted = results.sort((a, b) => a.priority - b.priority);
    await setCache(cacheKey, sorted, 600);

    res.json({ success: true, sources: sorted, errors: errors.length ? errors : undefined });
  } catch (error) {
    console.error("Sources error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب المصادر" });
  }
});

router.get("/akwam", async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q) return res.status(400).json({ error: "Search query required" });

    const cacheKey = `akwam-search:${q}:${type || ""}`;
    const cached = await getCached(cacheKey, 600);
    if (cached) return res.json({ success: true, results: cached });

    const response = await fetch(
      `https://ak.sv/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ""}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await response.text();

    const results = [];
    const titleRegex = /<a[^>]+class="[^"]*title[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;
    while ((match = titleRegex.exec(html)) !== null) {
      results.push({ url: match[1], title: match[2].trim() });
    }

    await setCache(cacheKey, results, 600);
    res.json({ success: true, results });
  } catch (error) {
    console.error("Akwam search error:", error);
    res.status(500).json({ error: "فشل في البحث في أكوام" });
  }
});

router.get("/arabseed", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Search query required" });

    const cacheKey = `arabseed-search:${q}`;
    const cached = await getCached(cacheKey, 600);
    if (cached) return res.json({ success: true, results: cached });

    const response = await fetch(
      `https://arabseed.ink/?s=${encodeURIComponent(q)}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const html = await response.text();

    const results = [];
    const titleRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;
    while ((match = titleRegex.exec(html)) !== null) {
      const href = match[1];
      const title = match[2].trim();
      if (href.includes("arabseed") && title.length > 3) {
        results.push({ url: href, title });
      }
    }

    await setCache(cacheKey, results, 600);
    res.json({ success: true, results });
  } catch (error) {
    console.error("ArabSeed search error:", error);
    res.status(500).json({ error: "فشل في البحث في أراب سيد" });
  }
});

router.get("/resolver", async (req, res) => {
  try {
    const { type, id, season, episode } = req.query;
    if (!type || !id) {
      return res.status(400).json({ error: "Type and id required" });
    }

    const cacheKey = `resolver:${type}:${id}:${season || ""}:${episode || ""}`;
    const cached = await getCached(cacheKey, 600);
    if (cached) return res.json({ success: true, streams: cached });

    const streams = await resolveStreams(type, id, season, episode);
    await setCache(cacheKey, streams, 600);

    res.json({ success: true, streams });
  } catch (error) {
    console.error("Resolver error:", error);
    res.status(500).json({ error: "فشل في حل البث" });
  }
});

export default router;
