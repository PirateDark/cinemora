import { useEffect, useState } from "react";
import MediaCard from "./MediaCard";
import MediaSkeleton from "./MediaSkeleton";
import ErrorState from "./ErrorState";
import SEO from "./SEO";
import { filterLiveAction, TmdbItem } from "../utils/contentGuard";

interface Country {
  code: string;
  label: string;
}

interface CategoryPageProps<T> {
  title: string;
  documentTitle: string;
  mediaType: "movie" | "tv";
  errorMessage: string;
  fetchFn: (page: number, country?: string) => Promise<{ results: T[]; total_pages: number }>;
  countries?: Country[];
  useFilterLiveAction?: boolean;
}

export default function CategoryPage<T extends { id: number }>({
  title,
  documentTitle,
  mediaType,
  errorMessage,
  fetchFn,
  countries,
  useFilterLiveAction,
}: CategoryPageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries?.[0]?.code);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchItems = async (page: number, country?: string) => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetchFn(page, country);
      const results = useFilterLiveAction ? filterLiveAction(response.results as unknown as TmdbItem[]) as T[] : response.results;
      setItems(results);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(currentPage, selectedCountry);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedCountry]);

  if (error) return <ErrorState message={errorMessage} />;

  const toMediaCard = (item: T) => {
    if (mediaType === "tv") {
      return { ...item, title: (item as Record<string, unknown>).name as string, media_type: "tv" as const };
    }
    return item;
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setCurrentPage(1);
  };

  return (
    <div>
      <SEO title={documentTitle} />
      {countries && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
          <div className="flex flex-wrap gap-2">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountryChange(country.code)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  selectedCountry === country.code
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {country.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {!countries && (
        <h1 className="text-2xl font-black mb-6 tracking-tight text-white">{title}</h1>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MediaSkeleton key={i} />)
          : items.map((item) => (
              <MediaCard key={item.id} media={toMediaCard(item)} type={mediaType} />
            ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10 mb-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-6 py-3 md:px-5 md:py-2 bg-gray-700 hover:bg-gray-600 rounded-xl md:rounded-lg disabled:opacity-40 transition font-semibold text-sm active:scale-95"
          >
            السابق
          </button>
          <span className="text-gray-300 font-medium text-sm px-2">
            {currentPage} من {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="px-6 py-3 md:px-5 md:py-2 bg-gray-700 hover:bg-gray-600 rounded-xl md:rounded-lg disabled:opacity-40 transition font-semibold text-sm active:scale-95"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
