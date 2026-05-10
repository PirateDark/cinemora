// Centralized API configuration — single source of truth for TMDB access
import axios from "axios";

// Global timeout prevents infinite loading when TMDB is unresponsive
axios.defaults.timeout = 15000;

export const TMDB_API_KEY = "ff54d7a5fdc2ab56530491ac8d378131";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Shared axios instance with defaults
export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});
