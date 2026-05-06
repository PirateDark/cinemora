import axios from "axios";

const TMDB_API_KEY = "ff54d7a5fdc2ab56530491ac8d378131";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
}

export interface TmdbTvShow {
  id: number;
  name: string;
  poster_path: string;
  vote_average: number;
  first_air_date: string;
  overview: string;
}

export const getPopularMovies = async (page: number = 1) => {
  const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
    params: { api_key: TMDB_API_KEY, page, language: "ar" },
  });
  return {
    results: response.data.results,
    total_pages: response.data.total_pages,
  };
};

export const getPopularTvShows = async (page: number = 1) => {
  const response = await axios.get(`${TMDB_BASE_URL}/tv/popular`, {
    params: { api_key: TMDB_API_KEY, page, language: "ar" },
  });
  return {
    results: response.data.results,
    total_pages: response.data.total_pages,
  };
};

export const getMovieDetails = async (id: number) => {
  const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
    params: { api_key: TMDB_API_KEY, language: "ar" },
  });
  return response.data;
};

export const getTvShowDetails = async (id: number) => {
  const response = await axios.get(`${TMDB_BASE_URL}/tv/${id}`, {
    params: { api_key: TMDB_API_KEY, language: "ar" },
  });
  return response.data;
};

export const searchMulti = async (query: string) => {
  const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
    params: { api_key: TMDB_API_KEY, query, language: "ar" },
  });
  return response.data.results || [];
};

// دوال فارغة للتوافق
export const getOfficialTrailerKey = async () => null;
export const getTopRatedMovies = getPopularMovies;
export const getUpcomingMovies = getPopularMovies;
export const getTopRatedTvShows = getPopularTvShows;
