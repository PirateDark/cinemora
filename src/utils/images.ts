const TMDB_BASE = "https://image.tmdb.org/t/p/";

export function toWebp(url: string | null | undefined): string {
  if (!url || !url.includes(TMDB_BASE)) return url || "https://via.placeholder.com/300x450?text=No+Image";
  return url.replace(/\.(jpg|jpeg|png)$/i, ".webp");
}

export function tmdbImg(path: string | null | undefined, size = "w500"): string {
  if (!path) return "https://via.placeholder.com/300x450?text=No+Image";
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${TMDB_BASE}${size}${clean}`;
}
