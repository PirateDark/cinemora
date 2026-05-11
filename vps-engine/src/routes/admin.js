import { Router } from "express";
import prisma from "../lib/prisma.js";
import { adminKeyAuth } from "../middleware/auth.js";
import { invalidateCache } from "../lib/redis.js";

const router = Router();

router.post("/verify-key", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key === process.env.ADMIN_KEY) {
    return res.json({ success: true });
  }
  res.status(403).json({ success: false, error: "مفتاح غير صحيح" });
});

router.post("/media/add", adminKeyAuth, async (req, res) => {
  try {
    const { tmdbId, title, arabicTitle, description, arabicDesc, posterPath, backdropPath, releaseDate, rating, genres, category } = req.body;

    if (!tmdbId) return res.status(400).json({ success: false, error: "TMDB ID مطلوب" });

    const media = await prisma.media.upsert({
      where: { tmdbId },
      create: { tmdbId, title, arabicTitle, description, arabicDesc, posterPath, backdropPath, releaseDate, rating, genres: genres || [], category: category || "movie" },
      update: { title, arabicTitle, description, arabicDesc, posterPath, backdropPath, releaseDate, rating, genres: genres || [], category: category || "movie" },
    });

    await invalidateCache("media:*");
    await invalidateCache("category:*");

    res.json({ success: true, media });
  } catch (error) {
    console.error("Admin add media error:", error);
    res.status(500).json({ success: false, error: "فشل في إضافة المحتوى" });
  }
});

router.get("/media", adminKeyAuth, async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category) where.category = category;

    const items = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { episodes: true, serverLinks: true } } },
    });

    res.json({ success: true, items });
  } catch (error) {
    console.error("Admin list media error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب المحتوى" });
  }
});

router.delete("/media/:id", adminKeyAuth, async (req, res) => {
  try {
    await prisma.media.delete({ where: { id: req.params.id } });
    await invalidateCache("media:*");
    await invalidateCache("category:*");
    res.json({ success: true });
  } catch (error) {
    console.error("Admin delete media error:", error);
    res.status(500).json({ success: false, error: "فشل في حذف المحتوى" });
  }
});

router.get("/media/:id", adminKeyAuth, async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
      include: {
        episodes: { orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }] },
        serverLinks: { where: { isActive: true }, orderBy: { priority: "asc" } },
      },
    });
    if (!media) return res.status(404).json({ success: false, error: "غير موجود" });
    res.json({ success: true, media });
  } catch (error) {
    console.error("Admin get media error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب البيانات" });
  }
});

router.post("/episodes/add", adminKeyAuth, async (req, res) => {
  try {
    const { mediaId, episodes } = req.body;
    if (!mediaId || !episodes?.length) {
      return res.status(400).json({ success: false, error: "بيانات الحلقات مطلوبة" });
    }

    await prisma.$transaction(
      episodes.map(ep =>
        prisma.episode.upsert({
          where: { mediaId_seasonNumber_episodeNumber: { mediaId, seasonNumber: ep.seasonNumber, episodeNumber: ep.episodeNumber } },
          create: { mediaId, ...ep },
          update: { title: ep.title, overview: ep.overview, stillPath: ep.stillPath, airDate: ep.airDate, runtime: ep.runtime },
        })
      )
    );

    await invalidateCache(`media:${mediaId}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Admin add episodes error:", error);
    res.status(500).json({ success: false, error: "فشل في إضافة الحلقات" });
  }
});

router.post("/server-links/add", adminKeyAuth, async (req, res) => {
  try {
    const { mediaId, episodeId, server, label, url, type, priority } = req.body;
    if (!mediaId || !url) {
      return res.status(400).json({ success: false, error: "بيانات الرابط مطلوبة" });
    }

    const link = await prisma.serverLink.create({
      data: { mediaId, episodeId: episodeId || null, server, label, url, type: type || "iframe", priority: priority || 0 },
    });

    await invalidateCache(`media:${mediaId}`);
    await invalidateCache("sources:*");

    res.json({ success: true, link });
  } catch (error) {
    console.error("Admin add server link error:", error);
    res.status(500).json({ success: false, error: "فشل في إضافة الرابط" });
  }
});

router.delete("/episodes/:id", adminKeyAuth, async (req, res) => {
  try {
    const episode = await prisma.episode.findUnique({ where: { id: req.params.id } });
    if (!episode) return res.status(404).json({ success: false, error: "غير موجود" });
    await prisma.episode.delete({ where: { id: req.params.id } });
    await invalidateCache(`media:${episode.mediaId}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Admin delete episode error:", error);
    res.status(500).json({ success: false, error: "فشل في حذف الحلقة" });
  }
});

router.delete("/server-links/:id", adminKeyAuth, async (req, res) => {
  try {
    const link = await prisma.serverLink.findUnique({ where: { id: req.params.id } });
    if (!link) return res.status(404).json({ success: false, error: "غير موجود" });
    await prisma.serverLink.delete({ where: { id: req.params.id } });
    await invalidateCache(`media:${link.mediaId}`);
    await invalidateCache("sources:*");
    res.json({ success: true });
  } catch (error) {
    console.error("Admin delete server link error:", error);
    res.status(500).json({ success: false, error: "فشل في حذف الرابط" });
  }
});

export default router;
