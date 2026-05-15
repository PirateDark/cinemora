import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMulti, TmdbMovie } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import MediaSkeleton from "../components/MediaSkeleton";
import SEO from "../components/SEO";
import { Search, X, Clock } from "lucide-react";

interface SearchResult extends TmdbMovie {
  media_type: "movie" | "tv";
  name?: string;
  first_air_date?: string;
}

type FilterType = "all" | "movie" | "tv";

const SEARCH_HISTORY_KEY = "search_history";

function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function addToSearchHistory(query: string) {
  const history = getSearchHistory().filter((s) => s !== query);
  history.unshift(query);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

const SUGGESTIONS_POOL = [
  "أكشن", "رومانسية", "كوميديا", "رعب", "خيال علمي",
  "Marvel", "DC", "Harry Potter", "Star Wars", "Anime",
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(urlQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>(getSearchHistory());

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const commitQuery = (query: string) => {
    setSearchParams((prev) => {
      if (query.trim()) prev.set("q", query.trim());
      else prev.delete("q");
      return prev;
    });
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commitQuery(val), 300);
  };

  const handleClear = () => {
    setInputValue("");
    setSearchParams((prev) => { prev.delete("q"); return prev; });
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const handleHistoryClick = (q: string) => {
    setInputValue(q);
    commitQuery(q);
    setShowHistory(false);
  };

  useEffect(() => {
    if (!urlQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setSearched(true);
      try {
        const data = await searchMulti(urlQuery);
        const filtered = data.filter(
          (item: SearchResult) =>
            (item.media_type === "movie" || item.media_type === "tv") &&
            item.poster_path,
        );
        setResults(filtered);
        addToSearchHistory(urlQuery);
        setHistory(getSearchHistory());
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [urlQuery]);

  const filteredResults =
    typeFilter === "all"
      ? results
      : results.filter((r) => r.media_type === typeFilter);

  return (
    <div className="container mx-auto px-4 py-6" dir="rtl">
      <SEO title={urlQuery ? `بحث عن: ${urlQuery}` : "بحث - سينمورا"} description={urlQuery ? `نتائج البحث عن ${urlQuery} في سينمورا` : "ابحث عن أفلام ومسلسلات على سينمورا"} keywords="بحث, أفلام, مسلسلات, سينمورا" />

      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitQuery(inputValue);
                setShowHistory(false);
              }
            }}
            placeholder="ابحث عن فيلم أو مسلسل..."
            className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-4 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors text-base"
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showHistory && !inputValue.trim() && history.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-2xl animate-fadeIn">
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              آخر عمليات البحث
            </p>
            <div className="flex flex-wrap gap-2">
              {history.map((q) => (
                <button
                  key={q}
                  onMouseDown={() => handleHistoryClick(q)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {searched && !loading && (
        <div className="flex gap-2 mb-6">
          {(["all", "movie", "tv"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                typeFilter === t
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {t === "all" ? "الكل" : t === "movie" ? "أفلام" : "مسلسلات"}
            </button>
          ))}
        </div>
      )}

      {!urlQuery.trim() ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl">ابحث عن فيلم أو مسلسل...</p>
        </div>
      ) : searched && results.length === 0 && !loading ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400 mb-2">لا توجد نتائج لـ "{urlQuery}"</p>
          <p className="text-sm text-gray-500 mb-6">ربما تقصد...</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
            {SUGGESTIONS_POOL.filter((s) => s !== urlQuery).slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => { setInputValue(s); commitQuery(s); }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">
              نتائج البحث عن: <span className="text-rose-500">"{urlQuery}"</span>
              {typeFilter !== "all" && (
                <span className="text-sm text-gray-400 mr-2">
                  ({typeFilter === "movie" ? "أفلام" : "مسلسلات"})
                </span>
              )}
            </h1>
            <span className="text-sm text-gray-500">{filteredResults.length} نتيجة</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <MediaSkeleton key={i} />
                ))
              : filteredResults.map((item: SearchResult) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    type={item.media_type === "movie" ? "movie" : "tv"}
                  />
                ))}
          </div>
        </>
      )}
    </div>
  );
}
