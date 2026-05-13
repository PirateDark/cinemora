import axios from "axios";

axios.defaults.timeout = 15000;

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;
if (!tmdbApiKey) {
  throw new Error("VITE_TMDB_API_KEY is not set — add it to .env.local or Vercel env vars");
}
export const TMDB_API_KEY = tmdbApiKey;

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: { api_key: tmdbApiKey },
});

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_ENGINE_URL || "https://api.cinemoratv.online",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
