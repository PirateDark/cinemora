import { useState, useEffect, useCallback, useRef } from "react";
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
import SEO from "../components/SEO";
import { Play, ChevronLeft, ChevronRight, Star, RefreshCw, Info } from "lucide-react";

interface HeroItem {
  id: number;
  title: string;
  overview: string;
  backdrop_path?: string | null;
  poster_path?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: "movie" | "tv";
}

function HeroBanner({ items }: { items: HeroItem[] }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const featured = items.slice(0, 5);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % featured.length);
  }, [featured.length]);

  const prev = () => {
    setCurrent((prev) => (prev - 1 + featured.length) % featured.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next]);

  if (featured.length === 0) return null;

  const currentItem = featured[current];
  const date = currentItem.release_date || currentItem.first_air_date;

  return (
    <div className="relative w-full h-[50vh] min-h-[400px] md:h-[620px] rounded-3xl overflow-hidden mb-16 shadow-2xl group">
      <img
        key={currentItem.id}
        src={`https://image.tmdb.org/t/p/w1280${currentItem.backdrop_path || currentItem.poster_path}`}
        alt={currentItem.title}
        loading="lazy"
        className="w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-100"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-l from-gray-950/80 via-gray-950/20 to-transparent" />
      <div className="absolute inset-0 bg-black/10" />

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16">
        <div className="max-w-3xl animate-fadeInUp">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div className="flex items-center gap-1 bg-rose-600/20 backdrop-blur-md border border-rose-500/30 px-2.5 py-0.5 rounded-full">
              <Star className="w-3 h-3 fill-rose-500 text-rose-500" />
              <span className="text-rose-400 font-bold text-xs">{currentItem.vote_average?.toFixed(1)}</span>
            </div>
            {date && (
              <span className="text-gray-300 bg-gray-800/50 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs border border-gray-700/30">
                {new Date(date).getFullYear()}
              </span>
            )}
            <span className="text-gray-300 bg-gray-800/50 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs border border-gray-700/30">
              {currentItem.media_type === "movie" ? "فيلم" : "مسلسل"}
            </span>
          </div>

          <h2
            className="text-2xl md:text-6xl font-black mb-2 md:mb-4 text-white drop-shadow-2xl text-left tracking-tight leading-tight"
            dir="ltr"
          >
            {currentItem.title}
          </h2>

          {currentItem.overview && (
            <p
              className="text-gray-200 text-xs md:text-lg line-clamp-2 md:line-clamp-3 mb-4 md:mb-8 text-right leading-relaxed max-w-2xl ml-auto"
              dir="rtl"
            >
              {currentItem.overview}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/${currentItem.media_type}/${currentItem.id}`)}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-bold md:font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-rose-600/30"
            >
              <Play className="w-4 h-4 md:w-6 md:h-6 fill-white" />
              <span className="text-sm md:text-base">مشاهدة الآن</span>
            </button>
            <button
              onClick={() => navigate(`/${currentItem.media_type}/${currentItem.id}`)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold md:font-bold transition-all border border-white/15 active:scale-95"
            >
              <Info className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">التفاصيل</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 md:left-4 md:right-4 flex justify-between items-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-500">
        <button
          onClick={prev}
          className="bg-black/40 hover:bg-rose-600/80 backdrop-blur-xl text-white p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border border-white/10 active:scale-90"
          aria-label="السابق"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={next}
          className="bg-black/40 hover:bg-rose-600/80 backdrop-blur-xl text-white p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border border-white/10 active:scale-90"
          aria-label="التالي"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      <div className="absolute bottom-4 md:bottom-8 right-4 md:right-16 flex gap-1.5 md:gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-500 active:scale-90 ${
              i === current
                ? "w-6 md:w-8 h-1.5 md:h-1.5 bg-rose-600 shadow-lg shadow-rose-600/50"
                : "w-1.5 md:w-1.5 h-1.5 md:h-1.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={` slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

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
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetcherRef.current();
      setItems(data.results.slice(0, 12));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

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
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const [movies, tvShows, upcoming] = await Promise.all([
          getPopularMovies(1),
          getPopularTvShows(1),
          getUpcomingMovies(1),
        ]);

        const all: HeroItem[] = [
          ...movies.results.map((m) => ({
            ...m, media_type: "movie" as const, title: m.title,
          })),
          ...tvShows.results.map((s) => ({
            ...s, media_type: "tv" as const, title: s.name,
            release_date: s.first_air_date,
          })),
          ...upcoming.results.map((m) => ({
            ...m, media_type: "movie" as const, title: m.title,
          })),
        ];

        const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 10);
        setHeroItems(shuffled);
      } catch {
        // ignore
      } finally {
        setHeroLoading(false);
      }
    };
    fetchHero();
  }, []);

  return (
    <div className="space-y-4">
      <SEO title="الرئيسية - عالم الدراما والسينما" />
      {heroLoading ? (
        <div className="w-full h-[460px] md:h-[620px] rounded-3xl bg-gray-800/50 animate-pulse mb-16 shimmer" />
      ) : (
        <HeroBanner items={heroItems} />
      )}

      <Section title="🎬 أفلام رائجة" fetcher={() => getPopularMovies(1)} type="movie" />
      <Section title="📺 مسلسلات رائجة" fetcher={() => getPopularTvShows(1)} type="tv" />
      <Section title="⭐ أعلى تقييماً (أفلام)" fetcher={() => getTopRatedMovies(1)} type="movie" />
      <Section title="⭐ أعلى تقييماً (مسلسلات)" fetcher={() => getTopRatedTvShows(1)} type="tv" />
      <Section title="🔜 قادم قريباً" fetcher={() => getUpcomingMovies(1)} type="movie" />
    </div>
  );
}
