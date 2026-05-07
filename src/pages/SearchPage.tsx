import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMulti } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setSearched(true);
      try {
        const data = await searchMulti(query);
        const filtered = data.filter(
          (item: any) =>
            (item.media_type === "movie" || item.media_type === "tv") &&
            item.poster_path,
        );
        setResults(filtered);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-6">
      {!query.trim() ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">ابحث عن فيلم أو مسلسل...</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">لا توجد نتائج لـ "{query}"</p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-6">
            نتائج البحث عن: <span className="text-rose-500">"{query}"</span>
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item: any) => (
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
