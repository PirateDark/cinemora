import { useEffect, useState } from "react";
import { getPopularTvShows, TmdbTvShow } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";

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
    fetchShows(currentPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading && shows.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📺 TV Shows</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {shows.map((show) => (
          <MediaCard key={show.id} media={show} type="tv" />
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
