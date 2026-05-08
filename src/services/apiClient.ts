// Centralized API configuration — single source of truth for TMDB access
import axios from "axios";

export const TMDB_API_KEY =
  (import.meta.env.VITE_TMDB_API_KEY as string) || "ff54d7a5fdc2ab56530491ac8d378131";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Shared axios instance with defaults
export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});
