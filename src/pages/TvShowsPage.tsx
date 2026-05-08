import { useEffect, useState } from "react";
import { getPopularTvShows, TmdbTvShow } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";

export default function TvShowsPage() {
  const [shows, setShows] = useState<TmdbTvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchShows = async (pageNum: number) => {
    setLoading(true);
    const response = await getPopularTvShows(pageNum);
    setShows(response.results);
    setTotalPages(response.total_pages);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    document.title = "دراماكسيا | مسلسلات - أفضل المسلسلات العالمية والمحلية";
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
      <h1 className="text-2xl font-bold mb-6 tracking-tight">📺 مسلسلات</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
          : shows.map((show) => (
              <MediaCard key={show.id} media={show} type="tv" />
            ))}
      </div>
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
