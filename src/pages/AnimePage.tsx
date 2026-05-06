import { useEffect, useState } from "react";
import { getPopularTvShows, TmdbTvShow } from "../services/tmdbApi";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

export default function AnimePage() {
  const [animeList, setAnimeList] = useState<TmdbTvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await getPopularTvShows(1);
        // نعرض أول 20 مسلسل بدون فلترة (مؤقتاً)
        setAnimeList(response.results.slice(0, 20));
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
      <h1 className="text-3xl font-bold mb-6 text-center">الأنمي</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {animeList.map((anime) => (
          <MediaCard key={anime.id} media={anime} type="tv" />
        ))}
      </div>
    </div>
  );
}
