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
import MediaSkeleton from "../components/MediaSkeleton";
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
    <div className="relative w-full h-[450px] md:h-[600px] rounded-3xl overflow-hidden mb-12 shadow-2xl group">
      <img
        key={movie.id}
        src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path || movie.poster_path}`}
        alt={movie.title}
        className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-100"
      />
      
      {/* Cinematic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/20 to-transparent" />
      <div className="absolute inset-0 bg-black/10" />

      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
        <div className="max-w-3xl animate-fadeIn">
          <h2
            className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-2xl text-left tracking-tight"
            dir="ltr"
          >
            {movie.title}
          </h2>
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-1.5 bg-rose-600/20 backdrop-blur-md border border-rose-500/30 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span className="text-rose-500 font-bold text-sm">
                {movie.vote_average?.toFixed(1)}
              </span>
            </div>
            {movie.release_date && (
              <span className="text-gray-300 font-medium bg-gray-800/40 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-gray-700/50">
                {new Date(movie.release_date).getFullYear()}
              </span>
            )}
            <span className="text-gray-300 font-medium bg-gray-800/40 backdrop-blur-md px-3 py-1 rounded-full text-sm border border-gray-700/50">
              HD
            </span>
          </div>
          
          {movie.overview && (
            <p
              className="text-gray-200 text-sm md:text-lg line-clamp-3 mb-8 text-right leading-relaxed max-w-2xl ml-auto"
              dir="rtl"
            >
              {movie.overview}
            </p>
          )}
          
          <div className="flex items-center justify-end md:justify-start gap-4">
            <button
              onClick={() => navigate(`/movie/${movie.id}`)}
              className="flex items-center gap-3 bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 shadow-xl shadow-rose-600/30 group/btn"
            >
              <Play className="w-6 h-6 fill-white group-hover/btn:scale-110 transition-transform" />
              مشاهدة الآن
            </button>
            <button
               onClick={() => navigate(`/movie/${movie.id}`)}
               className="hidden md:flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black transition-all border border-white/10"
            >
              التفاصيل
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <button
          onClick={prev}
          className="bg-black/20 hover:bg-rose-600 backdrop-blur-xl text-white p-4 rounded-2xl transition-all border border-white/10 hover:border-rose-500 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={next}
          className="bg-black/20 hover:bg-rose-600 backdrop-blur-xl text-white p-4 rounded-2xl transition-all border border-white/10 hover:border-rose-500 active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-8 right-16 flex gap-3">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === current ? "w-8 bg-rose-600 shadow-lg shadow-rose-600/50" : "w-2 bg-white/30 hover:bg-white/50"
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

  useEffect(() => {
    document.title = "دراماكسيا | الرئيسية - عالم الدراما والسينما";
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetcher();
      setItems(data.results.slice(0, 12));
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
      <h2 className="text-2xl font-black mb-6 tracking-tight text-white">{title}</h2>
      {error ? (
        <div className="flex items-center justify-center gap-3 py-10 bg-gray-800/20 rounded-2xl border border-gray-800/50 text-gray-400">
          <span>فشل تحميل هذا القسم</span>
          <button
            onClick={load}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)
            : items.map((item) => (
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
    <div className="space-y-4">
      {heroLoading ? (
        <div className="w-full h-[450px] md:h-[600px] rounded-3xl bg-gray-800 animate-pulse mb-12" />
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
