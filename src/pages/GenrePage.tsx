import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";
import ErrorState from "../components/ErrorState";
import SEO from "../components/SEO";
import { getMoviesByGenre, getTvByGenre, TmdbMovie, TmdbTvShow } from "../services/tmdbApi";

const genres: Record<string, { name: string; movieId: number; tvId: number }> = {
  action: { name: "أكشن", movieId: 28, tvId: 28 },
  drama: { name: "دراما", movieId: 18, tvId: 18 },
  horror: { name: "رعب", movieId: 27, tvId: 27 },
  animation: { name: "أنمي", movieId: 16, tvId: 16 },
  scifi: { name: "خيال علمي", movieId: 878, tvId: 10765 },
  comedy: { name: "كوميدي", movieId: 35, tvId: 35 },
  adventure: { name: "مغامرة", movieId: 12, tvId: 10759 },
  crime: { name: "جريمة", movieId: 80, tvId: 80 },
  documentary: { name: "وثائقي", movieId: 99, tvId: 99 },
  family: { name: "عائلي", movieId: 10751, tvId: 10751 },
  mystery: { name: "غموض", movieId: 9648, tvId: 9648 },
  war: { name: "حرب", movieId: 10752, tvId: 10752 },
};

export default function GenrePage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get("type") || "movie";

  const genre = genres[slug || ""];
  const genreId = type === "tv" ? genre?.tvId : genre?.movieId;

  const [items, setItems] = useState<(TmdbMovie | TmdbTvShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchItems = async (page: number) => {
    if (!genre || !genreId) return;
    setLoading(true);
    setError(false);
    try {
      const fn = type === "tv" ? getTvByGenre : getMoviesByGenre;
      const data = await fn(genreId, page);
      setItems(data.results);
      setTotalPages(data.total_pages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, slug, type]);

  if (!genre) return <ErrorState message="هذا التصنيف غير موجود" />;
  if (error) return <ErrorState message="فشل تحميل هذا التصنيف" />;

  return (
    <div>
      <SEO title={`${genre.name} - عالم الدراما والسينما`} />
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white">{genre.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/genre/${slug}?type=movie`)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              type === "movie"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            أفلام
          </button>
          <button
            onClick={() => navigate(`/genre/${slug}?type=tv`)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              type === "tv"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            مسلسلات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
          : items.map((item) => (
              <MediaCard key={item.id} media={item} type={type as "movie" | "tv"} />
            ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10 mb-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-6 py-3 md:px-5 md:py-2 bg-gray-700 hover:bg-gray-600 rounded-xl md:rounded-lg disabled:opacity-40 transition font-semibold text-sm active:scale-95"
          >
            السابق
          </button>
          <span className="text-gray-300 font-medium text-sm px-2">
            {currentPage} من {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="px-6 py-3 md:px-5 md:py-2 bg-gray-700 hover:bg-gray-600 rounded-xl md:rounded-lg disabled:opacity-40 transition font-semibold text-sm active:scale-95"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
