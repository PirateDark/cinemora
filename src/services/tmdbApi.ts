import axios from "axios";
import { TMDB_API_KEY, TMDB_BASE_URL } from "./apiClient";
import { getCache, setCache } from "../utils/cache";

export interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  release_date: string;
  overview: string;
  genre_ids: number[];
}

export interface TmdbTvShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  first_air_date: string;
  overview: string;
  genre_ids: number[];
  origin_country?: string[];
}

const mergeMovieResults = (enResults: TmdbMovie[], arResults: TmdbMovie[]) => {
  const arMap = new Map(arResults.map((m) => [m.id, m]));
  return enResults.map((enItem) => {
    const arItem = arMap.get(enItem.id);
    return { ...enItem, overview: arItem?.overview || enItem.overview };
  });
};

const mergeTvResults = (enResults: TmdbTvShow[], arResults: TmdbTvShow[]) => {
  const arMap = new Map(arResults.map((m) => [m.id, m]));
  return enResults.map((enItem) => {
    const arItem = arMap.get(enItem.id);
    return { ...enItem, overview: arItem?.overview || enItem.overview };
  });
};

export const getPopularMovies = async (page = 1) => {
  const cacheKey = `popular_movies_${page}`;
  const cached = getCache<{ results: TmdbMovie[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, page, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, page, language: "ar" },
    }),
  ]);
  
  const result = {
    results: mergeMovieResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getPopularTvShows = async (page = 1) => {
  const cacheKey = `popular_tv_${page}`;
  const cached = getCache<{ results: TmdbTvShow[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: { api_key: TMDB_API_KEY, page, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: { api_key: TMDB_API_KEY, page, language: "ar" },
    }),
  ]);

  const result = {
    results: mergeTvResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getMovieDetails = async (id: number) => {
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY, language: "ar" },
    }),
  ]);
  return {
    ...enRes.data,
    overview: arRes.data.overview || enRes.data.overview,
  };
};

export const getTvShowDetails = async (id: number) => {
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/tv/${id}`, {
      params: { api_key: TMDB_API_KEY, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/tv/${id}`, {
      params: { api_key: TMDB_API_KEY, language: "ar" },
    }),
  ]);
  return {
    ...enRes.data,
    overview: arRes.data.overview || enRes.data.overview,
  };
};

export const getSimilarMovies = async (id: number) => {
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/movie/${id}/similar`, {
      params: { api_key: TMDB_API_KEY, language: "en", page: 1 },
    }),
    axios.get(`${TMDB_BASE_URL}/movie/${id}/similar`, {
      params: { api_key: TMDB_API_KEY, language: "ar", page: 1 },
    }),
  ]);
  return mergeMovieResults(
    enRes.data.results.slice(0, 12),
    arRes.data.results.slice(0, 12),
  );
};

export const getSimilarTvShows = async (id: number) => {
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/tv/${id}/similar`, {
      params: { api_key: TMDB_API_KEY, language: "en", page: 1 },
    }),
    axios.get(`${TMDB_BASE_URL}/tv/${id}/similar`, {
      params: { api_key: TMDB_API_KEY, language: "ar", page: 1 },
    }),
  ]);
  return mergeTvResults(
    enRes.data.results.slice(0, 12),
    arRes.data.results.slice(0, 12),
  );
};

export const getCredits = async (type: "movie" | "tv", id: number) => {
  const res = await axios.get(`${TMDB_BASE_URL}/${type}/${id}/credits`, {
    params: { api_key: TMDB_API_KEY, language: "en" },
  });
  return res.data.cast?.slice(0, 12) || [];
};

export const getOfficialTrailerKey = async (
  type: "movie" | "tv",
  id: number,
): Promise<string | null> => {
  try {
    const res = await axios.get(`${TMDB_BASE_URL}/${type}/${id}/videos`, {
      params: { api_key: TMDB_API_KEY, language: "en" },
    });
    const videos = res.data.results || [];
    const trailer = videos.find(
      (v: { type: string; site: string; key: string }) => v.type === "Trailer" && v.site === "YouTube",
    );
    return trailer?.key || null;
  } catch {
    return null;
  }
};

export const getTopRatedMovies = async (page = 1) => {
  const cacheKey = `top_rated_movies_${page}`;
  const cached = getCache<{ results: TmdbMovie[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
      params: { api_key: TMDB_API_KEY, page, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
      params: { api_key: TMDB_API_KEY, page, language: "ar" },
    }),
  ]);
  
  const result = {
    results: mergeMovieResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getUpcomingMovies = async (page = 1) => {
  const cacheKey = `upcoming_movies_${page}`;
  const cached = getCache<{ results: TmdbMovie[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
      params: { api_key: TMDB_API_KEY, page, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/movie/upcoming`, {
      params: { api_key: TMDB_API_KEY, page, language: "ar" },
    }),
  ]);

  const result = {
    results: mergeMovieResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getTopRatedTvShows = async (page = 1) => {
  const cacheKey = `top_rated_tv_${page}`;
  const cached = getCache<{ results: TmdbTvShow[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/tv/top_rated`, {
      params: { api_key: TMDB_API_KEY, page, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/tv/top_rated`, {
      params: { api_key: TMDB_API_KEY, page, language: "ar" },
    }),
  ]);

  const result = {
    results: mergeTvResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const searchMulti = async (query: string) => {
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: { api_key: TMDB_API_KEY, query, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: { api_key: TMDB_API_KEY, query, language: "ar" },
    }),
  ]);
  interface SearchResultItem {
    id: number;
    title?: string;
    name?: string;
    overview?: string;
  }
  const enResults = enRes.data.results || [];
  const arResults = arRes.data.results || [];
  const arMap = new Map<number, SearchResultItem>(arResults.map((m: SearchResultItem) => [m.id, m]));
  return enResults.map((item: SearchResultItem) => {
    const arItem = arMap.get(item.id);
    return { ...item, overview: arItem?.overview || item.overview };
  });
};

export const getAsianShows = async (country: string, page = 1) => {
  const cacheKey = `asian_shows_${country}_${page}`;
  const cached = getCache<{ results: TmdbTvShow[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        with_origin_country: country,
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "en",
        page,
      },
    }),
    axios.get(`${TMDB_BASE_URL}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        with_origin_country: country,
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "ar",
        page,
      },
    }),
  ]);

  const result = {
    results: mergeTvResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getAsianMovies = async (country: string, page = 1) => {
  const cacheKey = `asian_movies_${country}_${page}`;
  const cached = getCache<{ results: TmdbMovie[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_origin_country: country,
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "en",
        page,
      },
    }),
    axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_origin_country: country,
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "ar",
        page,
      },
    }),
  ]);

  const result = {
    results: mergeMovieResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getTurkishMovies = async (page = 1) => {
  const cacheKey = `turkish_movies_${page}`;
  const cached = getCache<{ results: TmdbMovie[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_origin_country: "TR",
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "en",
        page,
      },
    }),
    axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_origin_country: "TR",
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "ar",
        page,
      },
    }),
  ]);

  const result = {
    results: mergeMovieResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getTurkishShows = async (page = 1) => {
  const cacheKey = `turkish_shows_${page}`;
  const cached = getCache<{ results: TmdbTvShow[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        with_origin_country: "TR",
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "en",
        page,
      },
    }),
    axios.get(`${TMDB_BASE_URL}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        with_origin_country: "TR",
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "ar",
        page,
      },
    }),
  ]);

  const result = {
    results: mergeTvResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getArabicMovies = async (page = 1) => {
  const cacheKey = `arabic_movies_${page}`;
  const cached = getCache<{ results: TmdbMovie[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_original_language: "ar",
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "en",
        page,
      },
    }),
    axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_original_language: "ar",
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "ar",
        page,
      },
    }),
  ]);

  const result = {
    results: arRes.data.results.map((arItem: TmdbMovie) => {
      const enItem = enRes.data.results.find((e: TmdbMovie) => e.id === arItem.id);
      return { ...arItem, overview: enItem?.overview || arItem.overview };
    }),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getArabicTvShows = async (page = 1) => {
  const cacheKey = `arabic_tv_${page}`;
  const cached = getCache<{ results: TmdbTvShow[]; total_pages: number }>(cacheKey);
  if (cached) return cached;

  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        with_original_language: "ar",
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "en",
        page,
      },
    }),
    axios.get(`${TMDB_BASE_URL}/discover/tv`, {
      params: {
        api_key: TMDB_API_KEY,
        with_original_language: "ar",
        without_genres: 16,
        sort_by: "popularity.desc",
        language: "ar",
        page,
      },
    }),
  ]);

  const result = {
    results: arRes.data.results.map((arItem: TmdbTvShow) => {
      const enItem = enRes.data.results.find((e: TmdbTvShow) => e.id === arItem.id);
      return { ...arItem, overview: enItem?.overview || arItem.overview };
    }),
    total_pages: enRes.data.total_pages,
  };

  setCache(cacheKey, result);
  return result;
};

export const getSeasonDetails = async (tvId: number, seasonNumber: number) => {
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}`, {
      params: { api_key: TMDB_API_KEY, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}`, {
      params: { api_key: TMDB_API_KEY, language: "ar" },
    }),
  ]);
  
  interface Episode {
    id: number;
    overview: string;
    name: string;
  }
  const mergedEpisodes = enRes.data.episodes.map((enEp: Episode) => {
    const arEp = arRes.data.episodes.find((s: Episode) => s.id === enEp.id);
    return {
      ...enEp,
      overview: arEp?.overview || enEp.overview,
      name: arEp?.name || enEp.name
    };
  });

  return {
    ...enRes.data,
    name: arRes.data.name || enRes.data.name,
    overview: arRes.data.overview || enRes.data.overview,
    episodes: mergedEpisodes
  };
};
