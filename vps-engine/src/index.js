import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import mediaRoutes from "./routes/media.js";
import scraperRoutes from "./routes/scraper.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.set("trust proxy", true);
const PORT = process.env.PORT || 5555;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/scraper", scraperRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Cinemora Engine running on port ${PORT}`);
});
