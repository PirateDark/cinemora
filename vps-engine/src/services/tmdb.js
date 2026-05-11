import prisma from "../lib/prisma.js";
import { getCached, setCache } from "../lib/redis.js";

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

async function fetchTMDB(path) {
  const url = `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json();
}

export async function syncMovieFromTMDB(tmdbId) {
  const cacheKey = `tmdb:movie:${tmdbId}`;
  const cached = await getCached(cacheKey, 86400);
  if (cached) return cached;

  const [details, credits] = await Promise.all([
    fetchTMDB(`/movie/${tmdbId}?append_to_response=videos,external_ids`),
    fetchTMDB(`/movie/${tmdbId}/credits`),
  ]);

  const arabicRes = await fetchTMDB(`/movie/${tmdbId}?language=ar-SA`);
  const arabicTitle = arabicRes.title !== details.title ? arabicRes.title : null;
  const arabicDesc = arabicRes.overview ? arabicRes.overview : null;

  const media = {
    tmdbId: String(tmdbId),
    title: details.title,
    arabicTitle,
    description: details.overview || "",
    arabicDesc,
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    releaseDate: details.release_date,
    rating: details.vote_average,
    genres: details.genres?.map(g => g.name) || [],
    category: "movie",
  };

  await setCache(cacheKey, media, 86400);
  return media;
}

export async function syncTVFromTMDB(tmdbId) {
  const cacheKey = `tmdb:tv:${tmdbId}`;
  const cached = await getCached(cacheKey, 86400);
  if (cached) return cached;

  const [details, seasonCount] = await Promise.all([
    fetchTMDB(`/tv/${tmdbId}?append_to_response=videos,external_ids`),
    fetchTMDB(`/tv/${tmdbId}`),
  ]);

  const arabicRes = await fetchTMDB(`/tv/${tmdbId}?language=ar-SA`);
  const arabicTitle = arabicRes.name !== details.name ? arabicRes.name : null;
  const arabicDesc = arabicRes.overview ? arabicRes.overview : null;

  const media = {
    tmdbId: String(tmdbId),
    title: details.name,
    arabicTitle,
    description: details.overview || "",
    arabicDesc,
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    releaseDate: details.first_air_date,
    rating: details.vote_average,
    genres: details.genres?.map(g => g.name) || [],
    category: "series",
    seasons: details.number_of_seasons || 0,
  };

  const episodes = [];
  for (let s = 1; s <= (details.number_of_seasons || 1); s++) {
    try {
      const seasonData = await fetchTMDB(`/tv/${tmdbId}/season/${s}`);
      for (const ep of seasonData.episodes || []) {
        episodes.push({
          seasonNumber: s,
          episodeNumber: ep.episode_number,
          title: ep.name || "",
          overview: ep.overview || "",
          stillPath: ep.still_path,
          airDate: ep.air_date,
          runtime: ep.runtime || details.episode_run_time?.[0],
        });
      }
    } catch { continue; }
  }

  await setCache(cacheKey, { media, episodes }, 86400);
  return { media, episodes };
}
