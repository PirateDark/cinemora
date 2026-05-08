import { useEffect, useState } from "react";
import MediaCard from "../components/MediaCard";
import ErrorState from "../components/ErrorState";
import { getAsianShows, TmdbTvShow } from "../services/tmdbApi";
import MediaSkeleton from "../components/MediaSkeleton";

const COUNTRIES = [
  { code: "KR", label: "🇰🇷 كورية" },
  { code: "JP", label: "🇯🇵 يابانية" },
  { code: "CN", label: "🇨🇳 صينية" },
  { code: "TW", label: "🇹🇼 تايوانية" },
];

export default function AsianPage() {
  const [shows, setShows] = useState<TmdbTvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("KR");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchShows = async (country: string, pageNum: number) => {
    setLoading(true);
    try {
      const response = await getAsianShows(country, pageNum);
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
    setCurrentPage(1);
    fetchShows(selectedCountry, 1);
  }, [selectedCountry]);

  useEffect(() => {
    document.title = "دراماكسيا | دراما آسيوية - كورية، يابانية، صينية";
    fetchShows(selectedCountry, currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCountry, currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (error) return <ErrorState message="فشل تحميل المسلسلات الآسيوية" />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <span className="text-rose-500">🌏</span> دراما آسيوية
        </h1>

        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => {
                setSelectedCountry(country.code);
                setCurrentPage(1);
              }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                selectedCountry === country.code
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {country.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
          : shows.map((show) => (
              <MediaCard
                key={show.id}
                media={{ ...show, title: show.name }}
                type="tv"
              />
            ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10 mb-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1 || loading}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40 transition font-semibold"
          >
            السابق
          </button>
          <span className="text-gray-300 font-medium">
            صفحة {currentPage} من {totalPages}
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
