import { useEffect, useState } from "react";
import { getPopularTvShows, TmdbTvShow } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import SEO from "../components/SEO";
import { Tv } from "lucide-react";

export default function TvShowsPage() {
  const [shows, setShows] = useState<TmdbTvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchShows = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPopularTvShows(pageNum);
      setShows(response.results);
      setTotalPages(response.total_pages);
    } catch {
      setError("فشل تحميل المسلسلات. حاول مرة أخرى.");
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetchShows(currentPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div>
      <SEO title="مسلسلات - أفضل المسلسلات العالمية والمحلية" />
      <h1 className="text-2xl font-bold mb-6 tracking-tight">📺 مسلسلات</h1>
      {error ? (
        <ErrorState message={error} />
      ) : !loading && shows.length === 0 ? (
        <EmptyState
          title="لا توجد مسلسلات"
          message="لم يتم العثور على مسلسلات في هذه الصفحة."
          icon={<Tv className="w-16 h-16 text-gray-600" />}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
            : shows.map((show) => (
                <MediaCard key={show.id} media={show} type="tv" />
              ))}
        </div>
      )}
      {totalPages > 0 && (
        <div className="flex justify-center items-center gap-3 mt-10 mb-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1 || loading}
            className="px-6 py-3 md:px-5 md:py-2 bg-gray-700 hover:bg-gray-600 rounded-xl md:rounded-lg disabled:opacity-40 transition font-semibold text-sm active:scale-95"
          >
            السابق
          </button>
          <span className="text-gray-300 text-sm px-2">
            <span className="text-white font-bold">{currentPage}</span>
            <span className="mx-1">من</span>
            <span className="text-white font-bold">{totalPages}</span>
          </span>
          <button
            onClick={handleNext}
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
