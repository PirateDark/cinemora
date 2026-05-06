import { useEffect, useState } from "react";
import { getPopularTvShows, TmdbTvShow } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

export default function AsianPage() {
  const [shows, setShows] = useState<TmdbTvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await getPopularTvShows(1);
        // نعرض أول 20 مسلسل بدون فلترة (مؤقتاً)
        setShows(response.results.slice(0, 20));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message="فشل تحميل البيانات" />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">مسلسلات آسيوية</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {shows.map((show) => (
          <MediaCard key={show.id} media={show} type="tv" />
        ))}
      </div>
    </div>
  );
}
