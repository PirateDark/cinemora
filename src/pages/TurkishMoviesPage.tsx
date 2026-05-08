import { useEffect, useState } from "react";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";
import ErrorState from "../components/ErrorState";
import { getTurkishMovies, TmdbMovie } from "../services/tmdbApi";

export default function TurkishMoviesPage() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await getTurkishMovies(pageNum);
      setMovies(response.results);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    document.title = "دراماكسيا | أفلام تركية - أحدث الأفلام التركية المترجمة";
    fetchMovies(currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (error) return <ErrorState message="فشل تحميل الأفلام التركية" />;

  return (
    <div>
      <h1 className="text-2xl font-black mb-6 tracking-tight text-white">🎬 أفلام تركية</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
          : movies.map((movie) => (
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
