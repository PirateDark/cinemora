import { useEffect, useState } from "react";
import axios from "axios";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

const TMDB_API_KEY = "ff54d7a5fdc2ab56530491ac8d378131";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface TurkishShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  first_air_date?: string;
  overview: string;
}

export default function TurkishShowsPage() {
  const [shows, setShows] = useState<TurkishShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchShows = async (pageNum: number) => {
    setLoading(true);
    setError(false);
    try {
      const [enRes, arRes] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/discover/tv`, {
          params: {
            api_key: TMDB_API_KEY,
            with_origin_country: "TR",
            sort_by: "popularity.desc",
            language: "en",
            page: pageNum,
          },
        }),
        axios.get(`${TMDB_BASE_URL}/discover/tv`, {
          params: {
            api_key: TMDB_API_KEY,
            with_origin_country: "TR",
            sort_by: "popularity.desc",
            language: "ar",
            page: pageNum,
          },
        }),
      ]);

      const arMap = new Map(
        arRes.data.results.map((s: TurkishShow) => [s.id, s]),
      );

      const merged = enRes.data.results.map((enShow: TurkishShow) => {
        const arItem = arMap.get(enShow.id) as TurkishShow | undefined;
        return {
          ...enShow,
          overview: arItem?.overview || enShow.overview,
        };
      });

      setShows(merged);
      setTotalPages(Math.min(enRes.data.total_pages, 500));
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows(currentPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (loading && shows.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorState message="فشل تحميل المسلسلات التركية" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🎭 مسلسلات تركية</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {shows.map((show) => (
            <MediaCard
              key={show.id}
              media={{ ...show, title: show.name, media_type: "tv" }}
              type="tv"
            />
          ))}
        </div>
      )}

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
