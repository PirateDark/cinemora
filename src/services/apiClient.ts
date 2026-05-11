import axios from "axios";

axios.defaults.timeout = 15000;

export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "ff54d7a5fdc2ab56530491ac8d378131";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

tmdbClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
