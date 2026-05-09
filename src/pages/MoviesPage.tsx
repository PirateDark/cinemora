import { useEffect, useState } from "react";
import { getPopularMovies, TmdbMovie } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import SEO from "../components/SEO";
import { Film } from "lucide-react";

export default function MoviesPage() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMovies = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPopularMovies(pageNum);
      setMovies(response.results);
      setTotalPages(response.total_pages);
    } catch {
      setError("فشل تحميل الأفلام. حاول مرة أخرى.");
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
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
      <SEO title="أفلام - أحدث الأفلام العالمية" />
      <h1 className="text-2xl font-bold mb-6 tracking-tight">🎬 أفلام</h1>
      {error ? (
        <ErrorState message={error} />
      ) : !loading && movies.length === 0 ? (
        <EmptyState
          title="لا توجد أفلام"
          message="لم يتم العثور على أفلام في هذه الصفحة."
          icon={<Film className="w-16 h-16 text-gray-600" />}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
            : movies.map((movie) => (
                <MediaCard key={movie.id} media={movie} type="movie" />
              ))}
        </div>
      )}
      {totalPages > 0 && (
        <div className="flex justify-center items-center gap-4 mt-10 mb-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1 || loading}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition font-semibold"
          >
            السابق
          </button>
          <span className="text-gray-300 text-sm">
            صفحة <span className="text-white font-bold">{currentPage}</span> من{" "}
            <span className="text-white font-bold">{totalPages}</span>
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || loading}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition font-semibold"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
