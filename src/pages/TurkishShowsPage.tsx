import { useEffect, useState } from "react";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";
import ErrorState from "../components/ErrorState";
import { getTurkishShows, TmdbTvShow } from "../services/tmdbApi";

export default function TurkishShowsPage() {
  const [shows, setShows] = useState<TmdbTvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchShows = async (pageNum: number) => {
    setLoading(true);
    setError(false);
    try {
      const response = await getTurkishShows(pageNum);
      setShows(response.results);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "دراماكسيا | مسلسلات تركية - أفضل المسلسلات التركية المترجمة";
    fetchShows(currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (error) return <ErrorState message="فشل تحميل المسلسلات التركية" />;

  return (
    <div>
      <h1 className="text-2xl font-black mb-6 tracking-tight text-white">🎭 مسلسلات تركية</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
          : shows.map((show) => (
              <MediaCard
                key={show.id}
                media={{ ...show, title: show.name, media_type: "tv" }}
                type="tv"
              />
            ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10 mb-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
