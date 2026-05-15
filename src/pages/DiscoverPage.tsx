import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { discoverContent, TmdbMovie, TmdbTvShow } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";
import SEO from "../components/SEO";

type MediaType = "movie" | "tv";

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "الأكثر شهرة" },
  { value: "vote_average.desc", label: "الأعلى تقييماً" },
  { value: "primary_release_date.desc", label: "الأحدث" },
  { value: "primary_release_date.asc", label: "الأقدم" },
];

const LANGUAGES = [
  { value: "", label: "الكل" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "ko", label: "Korean" },
  { value: "ja", label: "Japanese" },
  { value: "tr", label: "Turkish" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [type, setTypeState] = useState<MediaType>((searchParams.get("type") as MediaType) || "movie");
  const [year, setYearState] = useState<number | undefined>(searchParams.get("year") ? Number(searchParams.get("year")) : undefined);
  const [minRating, setMinRatingState] = useState<number | undefined>(searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined);
  const [language, setLanguageState] = useState<string>(searchParams.get("language") || "");
  const [sortBy, setSortByState] = useState(searchParams.get("sort") || "popularity.desc");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [results, setResults] = useState<(TmdbMovie | TmdbTvShow)[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [ratingInput, setRatingInput] = useState(minRating?.toString() || "");

  const setType = (t: MediaType) => { setTypeState(t); setPage(1); setSearchParams(prev => { prev.set("type", t); return prev; }); };
  const setYear = (y: number | undefined) => { setYearState(y); setPage(1); };
  const setMinRating = (r: number | undefined) => { setMinRatingState(r); setPage(1); };
  const setLanguage = (l: string) => { setLanguageState(l); setPage(1); };
  const setSortBy = (s: string) => { setSortByState(s); setPage(1); };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await discoverContent(type, { year, minRating, language, sortBy, page });
        setResults((data.results as any[]).filter((r: any) => r.poster_path));
        setTotalPages(Math.min(data.total_pages, 500));
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type, year, minRating, language, sortBy, page]);

  useEffect(() => {
    if (minRating !== undefined) setRatingInput(minRating.toString());
  }, [minRating]);

  return (
    <div className="container mx-auto px-4 py-6" dir="rtl">
      <SEO
        title="اكتشف - تصفح الأفلام والمسلسلات"
        description="اكتشف آلاف الأفلام والمسلسلات من جميع أنحاء العالم. فلتر حسب النوع والسنة والتقييم واللغة."
        keywords="اكتشف, أفلام, مسلسلات, فلتر, بحث متقدم"
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6 text-rose-500" />
          اكتشف
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          الفلاتر
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setType("movie")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            type === "movie"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          أفلام
        </button>
        <button
          onClick={() => setType("tv")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            type === "tv"
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          مسلسلات
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">السنة</label>
            <select
              value={year ?? ""}
              onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              <option value="">الكل</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">الترتيب</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">اللغة الأصلية</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">أقل تقييم</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={ratingInput}
                onChange={(e) => setRatingInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setMinRating(ratingInput ? Number(ratingInput) : undefined);
                  }
                }}
                placeholder="0 - 10"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setMinRating(ratingInput ? Number(ratingInput) : undefined)}
                className="px-3 py-2 bg-rose-600 rounded-xl text-xs hover:bg-rose-500 transition-colors"
              >
                تطبيق
              </button>
              {minRating !== undefined && (
                <button onClick={() => { setMinRating(undefined); setRatingInput(""); }} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!showFilters && (year || minRating !== undefined || language || sortBy !== "popularity.desc") && (
        <div className="flex flex-wrap gap-2 mb-6">
          {year && (
            <span className="flex items-center gap-1 px-3 py-1 bg-rose-600/20 text-rose-400 rounded-full text-xs">
              {year}
              <button onClick={() => setYear(undefined)}><X className="w-3 h-3" /></button>
            </span>
          )}
          {minRating !== undefined && (
            <span className="flex items-center gap-1 px-3 py-1 bg-rose-600/20 text-rose-400 rounded-full text-xs">
              تقييم ≥ {minRating}
              <button onClick={() => { setMinRating(undefined); setRatingInput(""); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {language && (
            <span className="flex items-center gap-1 px-3 py-1 bg-rose-600/20 text-rose-400 rounded-full text-xs">
              {LANGUAGES.find(l => l.value === language)?.label || language}
              <button onClick={() => setLanguage("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {sortBy !== "popularity.desc" && (
            <span className="flex items-center gap-1 px-3 py-1 bg-rose-600/20 text-rose-400 rounded-full text-xs">
              {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
              <button onClick={() => setSortBy("popularity.desc")}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
          : results.length > 0
            ? results.map((item: any) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  type={item.title ? "movie" : "tv"}
                />
              ))
            : !loading && (
                <div className="col-span-full text-center py-20 text-gray-400">
                  <p className="text-xl mb-2">لا توجد نتائج</p>
                  <p className="text-sm">حاول تغيير الفلاتر</p>
                </div>
              )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8" dir="ltr">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 bg-gray-800 rounded-xl disabled:opacity-30 hover:bg-gray-700 transition-colors text-sm"
          >
            السابق
          </button>
          <span className="text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-gray-800 rounded-xl disabled:opacity-30 hover:bg-gray-700 transition-colors text-sm"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
