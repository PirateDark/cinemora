import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPopularMovies,
  getPopularTvShows,
  getUpcomingMovies,
  getTopRatedMovies,
  getTopRatedTvShows,
  TmdbMovie,
  TmdbTvShow,
} from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Play, ChevronLeft, ChevronRight, Star, RefreshCw } from "lucide-react";

function HeroBanner({ movies }: { movies: TmdbMovie[] }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const featured = movies.slice(0, 5);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % featured.length);
  }, [featured.length]);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + featured.length) % featured.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (featured.length === 0) return null;

  const movie = featured[current];

  return (
    <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-2xl">
      <img
        key={movie.id}
        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
        alt={movie.title}
        className="w-full h-full object-cover transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <div className="max-w-2xl">
          <h2
            className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-lg text-left"
            dir="ltr"
          >
            {movie.title}
          </h2>
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
              <Star className="w-4 h-4 fill-yellow-400" />
              {movie.vote_average?.toFixed(1)}
            </span>
            {movie.release_date && (
              <span className="text-gray-300 text-sm">
                {new Date(movie.release_date).getFullYear()}
              </span>
            )}
          </div>
          {movie.overview && (
            <p
              className="text-gray-300 text-sm md:text-base line-clamp-2 mb-5 text-right leading-relaxed"
              dir="rtl"
            >
              {movie.overview}
            </p>
          )}
          <button
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
          >
            <Play className="w-5 h-5 fill-white" />
            مشاهدة الآن
          </button>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 right-6 flex gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? "bg-rose-500 w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// قسم مستقل — يشتغل بدون ما يأثر على الأقسام التانية
function Section({
  title,
  fetcher,
  type,
}: {
  title: string;
  fetcher: () => Promise<{ results: (TmdbMovie | TmdbTvShow)[] }>;
  type: "movie" | "tv";
}) {
  const [items, setItems] = useState<(TmdbMovie | TmdbTvShow)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetcher();
      setItems(data.results);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center gap-3 py-6 text-gray-400">
          <span>فشل تحميل هذا القسم</span>
          <button
            onClick={load}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <MediaCard key={item.id} media={item} type={type} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [popularMovies, setPopularMovies] = useState<TmdbMovie[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    getPopularMovies(1)
      .then((data) => setPopularMovies(data.results))
      .catch(() => {})
      .finally(() => setHeroLoading(false));
  }, []);

  return (
    <div>
      {heroLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <HeroBanner movies={popularMovies} />
      )}

      <Section
        title="🎬 أفلام رائجة"
        fetcher={() => getPopularMovies(1)}
        type="movie"
      />
      <Section
        title="📺 مسلسلات رائجة"
        fetcher={() => getPopularTvShows(1)}
        type="tv"
      />
      <Section
        title="⭐ أعلى تقييماً (أفلام)"
        fetcher={() => getTopRatedMovies(1)}
        type="movie"
      />
      <Section
        title="⭐ أعلى تقييماً (مسلسلات)"
        fetcher={() => getTopRatedTvShows(1)}
        type="tv"
      />
      <Section
        title="🔜 قادم قريباً"
        fetcher={() => getUpcomingMovies(1)}
        type="movie"
      />
    </div>
  );
}
