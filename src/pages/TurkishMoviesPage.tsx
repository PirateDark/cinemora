import { useEffect, useState } from "react";
import axios from "axios";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

const TMDB_API_KEY = "ff54d7a5fdc2ab56530491ac8d378131";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface TurkishMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  release_date?: string;
  overview: string;
}

export default function TurkishMoviesPage() {
  const [movies, setMovies] = useState<TurkishMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = async (pageNum: number) => {
    setLoading(true);
    try {
      const [enRes, arRes] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/discover/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            with_origin_country: "TR",
            sort_by: "popularity.desc",
            language: "en",
            page: pageNum,
          },
        }),
        axios.get(`${TMDB_BASE_URL}/discover/movie`, {
          params: {
            api_key: TMDB_API_KEY,
            with_origin_country: "TR",
            sort_by: "popularity.desc",
            language: "ar",
            page: pageNum,
          },
        }),
      ]);

      const merged = enRes.data.results.map((enMovie: TurkishMovie) => {
        const arMovie = arRes.data.results.find(
          (s: TurkishMovie) => s.id === enMovie.id,
        );
        return {
          ...enMovie,
          overview: arMovie?.overview || enMovie.overview,
        };
      });

      setMovies(merged);
      setTotalPages(enRes.data.total_pages);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading && movies.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorState message="فشل تحميل الأفلام التركية" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🎬 أفلام تركية</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MediaCard key={movie.id} media={movie} type="movie" />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition"
          >
            السابق
          </button>
          <span className="text-gray-300">
            صفحة {currentPage} من {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
