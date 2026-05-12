import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import { getAnimeMovies, getTrendingAnime, getPopularAnime, getTopRatedAnime } from "../services/anilistApi";
import { AnilistMedia } from "../types/anilist";
import AnimeCard from "../components/AnimeCard";
import MediaSkeleton from "../components/MediaSkeleton";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { Film, Flame } from "lucide-react";

export default function AnimeMoviesPage() {
  const [movies, setMovies] = useState<AnilistMedia[]>([]);
  const [trending, setTrending] = useState<AnilistMedia[]>([]);
  const [popular, setPopular] = useState<AnilistMedia[]>([]);
  const [topRated, setTopRated] = useState<AnilistMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [trendingData, popularData, topData] = await Promise.all([
          getTrendingAnime(1, 12),
          getPopularAnime(1, 12),
          getTopRatedAnime(1, 12),
        ]);
        setTrending(trendingData);
        setPopular(popularData);
        setTopRated(topData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const fetchMovies = async (page: number) => {
    setPageLoading(true);
    setError(false);
    try {
      const result = await getAnimeMovies(page, 12);
      setMovies(result.media);
      setTotalPages(result.totalPages);
    } catch {
      setError(true);
    } finally {
      setPageLoading(false);
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

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)}
      </div>
    );
  }

  if (error && movies.length === 0) {
    return <ErrorState message="فشل تحميل أفلام الأنمي" />;
  }

  return (
    <div>
      <SEO title="أفلام أنمي" />
      <div className="flex items-center gap-3 mb-8">
        <Film className="w-7 h-7 text-rose-500" />
        <h1 className="text-3xl font-bold">أفلام الأنمي</h1>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-500" /> الأكثر رواجاً
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {trending.map((anime) => <AnimeCard key={anime.id} anime={anime} type="movie" />)}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-200">🎬 جميع أفلام الأنمي</h2>
        {error && movies.length > 0 ? (
          <ErrorState message="فشل تحميل الصفحة" />
        ) : pageLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <EmptyState
            title="لا توجد أفلام"
            message="لم يتم العثور على أفلام أنمي في هذه الصفحة."
            icon={<Film className="w-16 h-16 text-gray-600" />}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((anime) => <AnimeCard key={anime.id} anime={anime} type="movie" />)}
            </div>
            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-4 mt-10 mb-4">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1 || pageLoading}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl disabled:opacity-40 transition font-semibold text-base active:scale-95"
                >
                  السابق
                </button>
                <span className="text-gray-300 text-base font-medium px-3 flex items-center gap-1.5">
                  <span className="text-white font-bold text-lg">{currentPage}</span>
                  <span>من</span>
                  <span className="text-white font-bold text-lg">{totalPages}</span>
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages || pageLoading}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl disabled:opacity-40 transition font-semibold text-base active:scale-95"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-200">⭐ الأكثر شعبية</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {popular.map((anime) => <AnimeCard key={anime.id} anime={anime} type="movie" />)}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-200">🏆 الأعلى تقييماً</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {topRated.map((anime) => <AnimeCard key={anime.id} anime={anime} type="movie" />)}
        </div>
      </section>
    </div>
  );
}
