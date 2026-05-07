import { useEffect, useState } from "react";
import axios from "axios";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

const TMDB_API_KEY = "ff54d7a5fdc2ab56530491ac8d378131";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface AsianShow {
  id: number;
  name: string;
  title?: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  first_air_date?: string;
  overview: string;
}

const COUNTRIES = [
  { code: "KR", label: "🇰🇷 كورية" },
  { code: "JP", label: "🇯🇵 يابانية" },
  { code: "CN", label: "🇨🇳 صينية" },
  { code: "TW", label: "🇹🇼 تايوانية" },
];

export default function AsianPage() {
  const [shows, setShows] = useState<AsianShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("KR");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchShows = async (country: string, pageNum: number) => {
    setLoading(true);
    try {
      const [enRes, arRes] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/discover/tv`, {
          params: {
            api_key: TMDB_API_KEY,
            with_origin_country: country,
            sort_by: "popularity.desc",
            language: "en",
            page: pageNum,
          },
        }),
        axios.get(`${TMDB_BASE_URL}/discover/tv`, {
          params: {
            api_key: TMDB_API_KEY,
            with_origin_country: country,
            sort_by: "popularity.desc",
            language: "ar",
            page: pageNum,
          },
        }),
      ]);

      const merged = enRes.data.results.map((enShow: AsianShow) => {
        const arShow = arRes.data.results.find(
          (s: AsianShow) => s.id === enShow.id,
        );
        return {
          ...enShow,
          overview: arShow?.overview || enShow.overview,
        };
      });

      setShows(merged);
      setTotalPages(enRes.data.total_pages);
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
    fetchShows(selectedCountry, currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (error) return <ErrorState message="فشل تحميل المسلسلات الآسيوية" />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">🌏 مسلسلات آسيوية</h1>

      {/* فلتر الدولة */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCountry(c.code)}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              selectedCountry === c.code
                ? "bg-rose-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && shows.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {shows.map((show) => (
              <MediaCard
                key={show.id}
                media={{ ...show, title: show.name }}
                type="tv"
              />
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
        </>
      )}
    </div>
  );
}
