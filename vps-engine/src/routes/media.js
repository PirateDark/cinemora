import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { getCached, setCache, invalidateCache } from "../lib/redis.js";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const { q, category } = req.query;
    if (!q) return res.status(400).json({ success: false, error: "مطلوب مصطلح البحث" });

    const cacheKey = `search:${category || "all"}:${q}`;
    const cached = await getCached(cacheKey, 120);
    if (cached) return res.json({ success: true, results: cached });

    const where = {
      title: { contains: q, mode: "insensitive" },
      status: "active",
    };
    if (category) where.category = category;

    const results = await prisma.media.findMany({
      where,
      select: { id: true, tmdbId: true, title: true, arabicTitle: true, posterPath: true, category: true, releaseDate: true, rating: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    });

    await setCache(cacheKey, results, 120);
    res.json({ success: true, results });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, error: "فشل البحث" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `media:${id}`;
    const cached = await getCached(cacheKey, 300);
    if (cached) return res.json({ success: true, media: cached });

    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        episodes: { orderBy: [{ seasonNumber: "asc" }, { episodeNumber: "asc" }] },
        serverLinks: { where: { isActive: true }, orderBy: { priority: "asc" } },
      },
    });

    if (!media) {
      return res.status(404).json({ success: false, error: "غير موجود" });
    }

    await setCache(cacheKey, media, 300);
    res.json({ success: true, media });
  } catch (error) {
    console.error("Media fetch error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب البيانات" });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const cacheKey = `category:${category}:${page}:${limit}`;
    const cached = await getCached(cacheKey, 300);
    if (cached) return res.json({ success: true, ...cached });

    const where = { category, status: "active" };
    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        select: { id: true, tmdbId: true, title: true, arabicTitle: true, posterPath: true, category: true, releaseDate: true, rating: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.media.count({ where }),
    ]);

    const result = { items, total, page, totalPages: Math.ceil(total / limit) };
    await setCache(cacheKey, result, 300);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Category fetch error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب البيانات" });
  }
});

router.post("/watch/start", authenticate, async (req, res) => {
  try {
    const mediaId = await resolveMediaId(req.body.mediaId || req.body.tmdbId);
    if (!mediaId) return res.status(404).json({ success: false, error: "المحتوى غير موجود" });
    const { episodeId } = req.body;
    const userId = req.user.id;

    const existing = await prisma.watchHistory.findUnique({
      where: { userId_mediaId_episodeId: { userId, mediaId, episodeId: episodeId || "" } },
    });

    if (!existing) {
      await prisma.watchHistory.create({
        data: { userId, mediaId, episodeId: episodeId || null, progress: 0, duration: 0 },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Watch start error:", error);
    res.status(500).json({ success: false, error: "فشل في تسجيل المشاهدة" });
  }
});

router.post("/watch/progress", authenticate, async (req, res) => {
  try {
    const mediaId = await resolveMediaId(req.body.mediaId || req.body.tmdbId);
    if (!mediaId) return res.status(404).json({ success: false, error: "المحتوى غير موجود" });
    const { episodeId, progress, duration } = req.body;
    const userId = req.user.id;

    await prisma.watchHistory.upsert({
      where: { userId_mediaId_episodeId: { userId, mediaId, episodeId: episodeId || "" } },
      create: { userId, mediaId, episodeId: episodeId || null, progress, duration },
      update: { progress, duration },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Watch progress error:", error);
    res.status(500).json({ success: false, error: "فشل في تحديث التقدم" });
  }
});

    if (!existing) {
      await prisma.watchHistory.create({
        data: { userId, mediaId, episodeId: episodeId || null, progress: 0, duration: 0 },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Watch start error:", error);
    res.status(500).json({ success: false, error: "فشل في تسجيل المشاهدة" });
  }
});

router.post("/watch/progress", authenticate, async (req, res) => {
  try {
    const { mediaId, episodeId, progress, duration } = req.body;
    const userId = req.user.id;

    await prisma.watchHistory.upsert({
      where: { userId_mediaId_episodeId: { userId, mediaId, episodeId: episodeId || "" } },
      create: { userId, mediaId, episodeId: episodeId || null, progress, duration },
      update: { progress, duration },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Watch progress error:", error);
    res.status(500).json({ success: false, error: "فشل في تحديث التقدم" });
  }
});

router.get("/watch/history", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await prisma.watchHistory.findMany({
      where: { userId },
      include: { media: { select: { id: true, title: true, posterPath: true, category: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
    res.json({ success: true, history });
  } catch (error) {
    console.error("Watch history error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب سجل المشاهدة" });
  }
});

router.post("/watchlist/add", authenticate, async (req, res) => {
  try {
    const mediaId = await resolveMediaId(req.body.mediaId || req.body.tmdbId);
    if (!mediaId) return res.status(404).json({ success: false, error: "المحتوى غير موجود" });
    await prisma.watchlist.create({
      data: { userId: req.user.id, mediaId },
    });
    await invalidateCache(`watchlist:${req.user.id}`);
    res.json({ success: true });
  } catch (error) {
    if (error.code === "P2002") {
      return res.json({ success: true, message: "موجود مسبقاً" });
    }
    console.error("Watchlist add error:", error);
    res.status(500).json({ success: false, error: "فشل في الإضافة" });
  }
});

router.delete("/watchlist/remove/:mediaId", authenticate, async (req, res) => {
  try {
    const mediaId = await resolveMediaId(req.params.mediaId);
    if (!mediaId) return res.status(404).json({ success: false, error: "المحتوى غير موجود" });
    await prisma.watchlist.deleteMany({
      where: { userId: req.user.id, mediaId },
    });
    await invalidateCache(`watchlist:${req.user.id}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Watchlist remove error:", error);
    res.status(500).json({ success: false, error: "فشل في الحذف" });
  }
});

  // ─── Favorites ───────────────────────────────────────────
async function resolveMediaId(input) {
  if (!input) return null;
  // Accept both Prisma cuid and numeric tmdbId
  const byId = await prisma.media.findUnique({ where: { id: input }, select: { id: true } });
  if (byId) return byId.id;
  const byTmdb = await prisma.media.findUnique({ where: { tmdbId: input }, select: { id: true } });
  return byTmdb?.id || null;
}

router.post("/favorites/add", authenticate, async (req, res) => {
  try {
    const mediaId = await resolveMediaId(req.body.mediaId || req.body.tmdbId);
    if (!mediaId) return res.status(404).json({ success: false, error: "المحتوى غير موجود" });
    await prisma.favorite.create({
      data: { userId: req.user.id, mediaId },
    });
    await invalidateCache(`favorites:${req.user.id}`);
    res.json({ success: true });
  } catch (error) {
    if (error.code === "P2002") {
      return res.json({ success: true, message: "موجود مسبقاً" });
    }
    console.error("Favorite add error:", error);
    res.status(500).json({ success: false, error: "فشل في الإضافة" });
  }
});

router.delete("/favorites/remove/:mediaId", authenticate, async (req, res) => {
  try {
    const mediaId = await resolveMediaId(req.params.mediaId);
    if (!mediaId) return res.status(404).json({ success: false, error: "المحتوى غير موجود" });
    await prisma.favorite.deleteMany({
      where: { userId: req.user.id, mediaId },
    });
    await invalidateCache(`favorites:${req.user.id}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Favorite remove error:", error);
    res.status(500).json({ success: false, error: "فشل في الحذف" });
  }
});

router.get("/favorites", authenticate, async (req, res) => {
  try {
    const cacheKey = `favorites:${req.user.id}`;
    const cached = await getCached(cacheKey, 60);
    if (cached) return res.json({ success: true, items: cached });

    const items = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: { media: { select: { id: true, title: true, arabicTitle: true, posterPath: true, category: true, rating: true } } },
      orderBy: { addedAt: "desc" },
    });

    await setCache(cacheKey, items, 60);
    res.json({ success: true, items });
  } catch (error) {
    console.error("Favorites fetch error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب المفضلة" });
  }
});

router.get("/watchlist", authenticate, async (req, res) => {
  try {
    const cacheKey = `watchlist:${req.user.id}`;
    const cached = await getCached(cacheKey, 60);
    if (cached) return res.json({ success: true, items: cached });

    const items = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      include: { media: { select: { id: true, title: true, arabicTitle: true, posterPath: true, category: true, rating: true } } },
      orderBy: { addedAt: "desc" },
    });

    await setCache(cacheKey, items, 60);
    res.json({ success: true, items });
  } catch (error) {
    console.error("Watchlist fetch error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب قائمة المشاهدة" });
  }
});

router.get("/favorites/count/:tmdbId", async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const media = await prisma.media.findUnique({ where: { tmdbId } });
    if (!media) return res.json({ success: true, count: 0 });
    const count = await prisma.favorite.count({ where: { mediaId: media.id } });
    res.json({ success: true, count });
  } catch (error) {
    console.error("Favorites count error:", error);
    res.status(500).json({ success: false, error: "فشل في جلب عدد المفضلة" });
  }
});

export default router;
