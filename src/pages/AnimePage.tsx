import { useEffect, useState } from "react";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  getAnimeSeries,
  getAnimeMovies,
} from "../services/anilistApi";
import { AnilistMedia } from "../types/anilist";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

function AnimeCard({ anime }: { anime: AnilistMedia }) {
  const title =
    anime.title.english ||
    anime.title.romaji ||
    anime.title.native ||
    "بدون عنوان";
  const imageUrl = anime.coverImage?.large || anime.coverImage?.medium || "";
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "?";
  const isMovie = anime.format === "MOVIE";

  return (
    <Link to={`/anime/${anime.id}`} className="block group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden bg-gray-900 hover:scale-105 transition-transform duration-300">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-64 object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />
        <div className="p-3">
          <h3 className="font-bold text-sm line-clamp-1 text-left" dir="ltr">
            {title}
          </h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-yellow-400 text-sm flex items-center gap-1">
              <Star className="w-3 h-3" /> {score}
            </span>
            <span className="text-xs text-gray-400">
              {isMovie ? "فيلم أنمي" : "مسلسل أنمي"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AnimePage() {
  const [trending, setTrending] = useState<AnilistMedia[]>([]);
  const [popular, setPopular] = useState<AnilistMedia[]>([]);
  const [topRated, setTopRated] = useState<AnilistMedia[]>([]);
  const [series, setSeries] = useState<AnilistMedia[]>([]);
  const [movies, setMovies] = useState<AnilistMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const [trendingData, popularData, topData, seriesData, moviesData] =
          await Promise.all([
            getTrendingAnime(1, 12),
            getPopularAnime(1, 12),
            getTopRatedAnime(1, 12),
            getAnimeSeries(1, 12),
            getAnimeMovies(1, 12),
          ]);
        setTrending(trendingData);
        setPopular(popularData);
        setTopRated(topData);
        setSeries(seriesData);
        setMovies(moviesData);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message="فشل تحميل الأنمي" />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">🎌 الأنمي</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🔥 الأكثر رواجاً</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {trending.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">📺 مسلسلات الأنمي</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {series.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🎬 أفلام الأنمي</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">⭐ الأكثر شعبية</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:widget-cols-5 xl:grid-cols-6 gap-4">
          {popular.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🏆 الأعلى تقييماً</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {topRated.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>
    </div>
  );
}
