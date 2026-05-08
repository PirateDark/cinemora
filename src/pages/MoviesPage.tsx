import { useEffect, useState } from "react";
import { getPopularMovies, TmdbMovie } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";

export default function MoviesPage() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = async (pageNum: number) => {
    setLoading(true);
    const response = await getPopularMovies(pageNum);
    setMovies(response.results);
    setTotalPages(response.total_pages);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    document.title = "دراماكسيا | أفلام - أحدث الأفلام العالمية";
    fetchMovies(currentPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 tracking-tight">🎬 أفلام</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
          : movies.map((movie) => (
              <MediaCard key={movie.id} media={movie} type="movie" />
            ))}
      </div>
      {totalPages > 0 && (
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
