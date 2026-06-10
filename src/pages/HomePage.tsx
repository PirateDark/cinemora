import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getPopularMovies,
  getPopularTvShows,
  getUpcomingMovies,
  getTopRatedMovies,
  getTopRatedTvShows,
  searchMulti,
  TmdbMovie,
  TmdbTvShow,
} from "../services/tmdbApi";
import { useDebounce } from "../hooks/useDebounce";
import { useFavorites } from "../hooks/useFavorites";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";
import LazyImage from "../components/LazyImage";
import SearchBar from "../components/SearchBar";
import SEO from "../components/SEO";
import AnnouncementBanner from "../components/AnnouncementBanner";
import { Play, ChevronLeft, ChevronRight, Star, RefreshCw, Search, ArrowLeft, Heart, Info } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const featured = items.slice(0, 12);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.children[0] as HTMLElement;
    if (!card) return;
    const cardWidth = card.offsetWidth + 12;
    const visible = Math.floor(container.clientWidth / cardWidth);
    const scrollBy = cardWidth * Math.max(visible, 1);
    container.scrollBy({
      left: dir === "right" ? scrollBy : -scrollBy,
      behavior: "smooth",
    });
  };

  if (featured.length === 0) return null;

  return (
    <div className="relative mb-12 group/carousel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">أبرز الأعمال</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="bg-gray-800/60 hover:bg-rose-600/80 text-white p-2 rounded-xl transition-all active:scale-90 border border-gray-700/30"
            aria-label="السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="bg-gray-800/60 hover:bg-rose-600/80 text-white p-2 rounded-xl transition-all active:scale-90 border border-gray-700/30"
            aria-label="التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        >
          {featured.map((item) => {
            const isMovie = item.media_type === "movie";
            const linkTo = `/${isMovie ? "movie" : "tv"}/${item.id}`;
            const posterUrl = item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "https://via.placeholder.com/300x450?text=No+Image";
            return (
              <div
                key={item.id}
                className="flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6 group/card relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800/50 hover:border-rose-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10"
              >
                <Link to={linkTo} className="block">
                <div className="aspect-[2/3]">
                  <LazyImage
                    src={posterUrl}
                    alt={item.title}
                    className="w-full h-full transition-transform duration-500 group-hover/card:scale-110"
                  />
                </div>
                </Link>

                {/* Hover overlay with buttons */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center gap-3 p-4">
                  <Link
                    to={linkTo}
                    className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-rose-600/30 active:scale-95"
                  >
                    <Info className="w-3.5 h-3.5" />
                    التفاصيل
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const favItem = {
                        id: item.id,
                        mal_id: item.id,
                        title: item.title,
                        name: item.title,
                        poster_path: item.poster_path || "",
                        vote_average: item.vote_average || 0,
                        overview: item.overview,
                        release_date: item.release_date || item.first_air_date || "",
                        genre_ids: [] as number[],
                        type: isMovie ? "movie" : ("tv" as "movie" | "tv"),
                        score: item.vote_average || 0,
                        images: {
                          jpg: { image_url: posterUrl, large_image_url: posterUrl },
                        },
                      };
                      if (isFavorite(item.id)) removeFavorite(item.id);
                      else addFavorite(favItem);
                    }}
                    className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-lg transition-all active:scale-95 border ${
                      isFavorite(item.id)
                        ? "bg-rose-600/20 border-rose-500/40 text-rose-400"
                        : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite(item.id) ? "fill-rose-500" : ""}`} />
                    {isFavorite(item.id) ? "إزالة من المفضلة" : "أضف للمفضلة"}
                  </button>
                </div>

                {/* Always visible: title + rating at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <p className="text-white font-bold text-xs line-clamp-1 text-right leading-relaxed mb-1">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-yellow-400 text-[10px] font-bold">{item.vote_average?.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400 text-[10px]">{isMovie ? "فيلم" : "مسلسل"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute left-0 top-0 bottom-2 w-12 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-start pr-1 z-10"
          aria-label="التالى"
        >
          <div className="bg-black/50 hover:bg-rose-600/80 backdrop-blur-sm text-white p-2 rounded-xl transition-all border border-white/10">
            <ChevronLeft className="w-5 h-5" />
          </div>
        </button>
        <button
          onClick={() => scroll("left")}
          className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#0a0a0a]/80 to-transparent opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 flex items-center justify-end pl-1 z-10"
          aria-label="السابق"
        >
          <div className="bg-black/50 hover:bg-rose-600/80 backdrop-blur-sm text-white p-2 rounded-xl transition-all border border-white/10">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
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
  const navigate = useNavigate();
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<(TmdbMovie | TmdbTvShow)[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);

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

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchMulti(debouncedSearch).then((data) => {
      const filtered = data.filter(
        (item: any) => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path
      );
      setSearchResults(filtered.slice(0, 12));
    }).catch(() => {}).finally(() => setSearching(false));
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      <SEO title="الرئيسية - عالم الدراما والسينما" />

      <AnnouncementBanner />

      {/* Search Section */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={(v) => setSearchQuery(v)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
            placeholder="ابحث عن فيلم أو مسلسل..."
            className="w-full bg-gray-800/50 border-2 border-gray-700/50 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 focus:bg-gray-800/80 transition-all text-base"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-white">
            <Search className="w-5 h-5 text-rose-500" /> نتائج البحث عن "{searchQuery}"
          </h2>
          {searching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <MediaSkeleton key={i} />)}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((item: any) => (
                <MediaCard key={item.id} media={item} type={item.media_type} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">لا توجد نتائج</p>
          )}
        </div>
      )}

      {!searchQuery.trim() && (<>
      {heroLoading ? (
        <div className="w-full h-[260px] rounded-2xl bg-gray-800/50 animate-pulse mb-12 shimmer" />
      ) : (
        <HeroBanner items={heroItems} />
      )}

      <Section title="🎬 أفلام رائجة" fetcher={() => getPopularMovies(1)} type="movie" />
      <Section title="📺 مسلسلات رائجة" fetcher={() => getPopularTvShows(1)} type="tv" />
      <Section title="⭐ أعلى تقييماً (أفلام)" fetcher={() => getTopRatedMovies(1)} type="movie" />
      <Section title="⭐ أعلى تقييماً (مسلسلات)" fetcher={() => getTopRatedTvShows(1)} type="tv" />
      <Section title="🔜 قادم قريباً" fetcher={() => getUpcomingMovies(1)} type="movie" />

      {/* Genre Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white">شاهد حسب النوع</h2>
          <Link
            to="/movies"
            className="flex items-center gap-1 text-sm text-rose-400 hover:text-rose-300 transition font-medium"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {[
            { slug: "action", name: "أكشن" },
            { slug: "drama", name: "دراما" },
            { slug: "horror", name: "رعب" },
            { slug: "animation", name: "أنمي" },
            { slug: "scifi", name: "خيال علمي" },
            { slug: "comedy", name: "كوميدي" },
            { slug: "adventure", name: "مغامرة" },
            { slug: "crime", name: "جريمة" },
            { slug: "documentary", name: "وثائقي" },
            { slug: "family", name: "عائلي" },
            { slug: "mystery", name: "غموض" },
            { slug: "war", name: "حرب" },
          ].map((genre) => (
            <Link
              key={genre.slug}
              to={`/genre/${genre.slug}?type=movie`}
              className="group relative flex items-center justify-between gap-2 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/30 hover:border-rose-500/30 hover:bg-gray-800/70 transition-all duration-300 active:scale-[0.97]"
            >
              <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                {genre.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-600/20 flex items-center justify-center shrink-0 group-hover:bg-rose-600/40 transition-colors">
                <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400 mr-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      </>)}
    </div>
  );
}
