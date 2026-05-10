import express from "express";
import cors from "cors";
import { connectDB } from "../lib/db.js";
import { Movie } from "../lib/models/Movie.js";

const router = express.Router();
const ADMIN_KEY = process.env.ADMIN_KEY || "admin123";

router.use(cors());
router.use(express.json());

function requireAuth(req, res, next) {
  const key = req.headers["x-admin-key"] || req.body?.key;
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ success: false, error: "مفتاح الدخول غير صحيح" });
  }
  next();
}

router.post("/verify-key", (req, res) => {
  const { key } = req.body;
  if (key === ADMIN_KEY) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "مفتاح الدخول غير صحيح" });
  }
});

router.post("/movies/add", requireAuth, async (req, res) => {
  try {
    const { tmdbId } = req.body;
    if (!tmdbId || !/^\d+$/.test(tmdbId)) {
      return res.status(400).json({ success: false, error: "معرف TMDB غير صالح" });
    }

    await connectDB();
    const apiKey = process.env.TMDB_API_KEY || "ff54d7a5fdc2ab56530491ac8d378131";
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=ar-SA`
    );
    const data = await response.json();

    if (!data.id) {
      return res.status(404).json({ success: false, error: "لم يتم العثور على الفيلم" });
    }

    const embedUrl = `https://superembed.stream/embed/movie/${data.id}`;
    const newMovie = await Movie.findOneAndUpdate(
      { tmdbId: data.id.toString() },
      {
        title: data.title,
        description: data.overview || "",
        posterPath: data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : "",
        backdropPath: data.backdrop_path
          ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
          : "",
        releaseDate: data.release_date || "",
        videoUrl: embedUrl,
        category: "movie",
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, movie: JSON.parse(JSON.stringify(newMovie)) });
  } catch (error) {
    console.error("Error adding movie:", error);
    res.status(500).json({ success: false, error: "فشل في إضافة المحتوى" });
  }
});

router.get("/movies", requireAuth, async (req, res) => {
  try {
    await connectDB();
    const filter = req.query.category ? { category: req.query.category } : {};
    const movies = await Movie.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, movies: JSON.parse(JSON.stringify(movies)) });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ success: false, error: "فشل في جلب البيانات" });
  }
});

router.delete("/movies/:id", requireAuth, async (req, res) => {
  try {
    await connectDB();
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting movie:", error);
    res.status(500).json({ success: false, error: "فشل في حذف المحتوى" });
  }
});

export default router;
