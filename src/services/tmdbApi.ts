import axios from "axios";

const TMDB_API_KEY = "ff54d7a5fdc2ab56530491ac8d378131";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, page, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY, page, language: "ar" },
    }),
  ]);
  return {
    results: mergeMovieResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };
};

export const getPopularTvShows = async (page = 1) => {
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: { api_key: TMDB_API_KEY, page, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/tv/popular`, {
      params: { api_key: TMDB_API_KEY, page, language: "ar" },
    }),
  ]);
  return {
    results: mergeTvResults(enRes.data.results, arRes.data.results),
    total_pages: enRes.data.total_pages,
  };
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
      (v: any) => v.type === "Trailer" && v.site === "YouTube",
    );
    return trailer?.key || null;
  } catch {
    return null;
  }
};

export const getTopRatedMovies = getPopularMovies;
export const getUpcomingMovies = getPopularMovies;
export const getTopRatedTvShows = getPopularTvShows;

export const searchMulti = async (query: string) => {
  const [enRes, arRes] = await Promise.all([
    axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: { api_key: TMDB_API_KEY, query, language: "en" },
    }),
    axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: { api_key: TMDB_API_KEY, query, language: "ar" },
    }),
  ]);
  const enResults = enRes.data.results || [];
  const arResults = arRes.data.results || [];
  const arMap = new Map(arResults.map((m: any) => [m.id, m]));
  return enResults.map((item: any) => {
    const arItem = arMap.get(item.id) as any;
    return { ...item, overview: arItem?.overview || item.overview };
  });
};
