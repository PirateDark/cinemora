import { useState, useEffect } from "react";
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
import ErrorState from "../components/ErrorState";

export default function HomePage() {
  const [popularMovies, setPopularMovies] = useState<TmdbMovie[]>([]);
  const [popularTv, setPopularTv] = useState<TmdbTvShow[]>([]);
  const [upcoming, setUpcoming] = useState<TmdbMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TmdbMovie[]>([]);
  const [topRatedTv, setTopRatedTv] = useState<TmdbTvShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movies, tv, upcomingMovies, topMovies, topTv] =
          await Promise.all([
            getPopularMovies(1),
            getPopularTvShows(1),
            getUpcomingMovies(1),
            getTopRatedMovies(1),
            getTopRatedTvShows(1),
          ]);
        // بعد التعديل في tmdbApi، كل دالة تعيد كائن { results, total_pages }
        setPopularMovies(movies.results);
        setPopularTv(tv.results);
        setUpcoming(upcomingMovies.results);
        setTopRatedMovies(topMovies.results);
        setTopRatedTv(topTv.results);
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message="فشل تحميل البيانات" />;

  return (
    <div>
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">أفلام رائجة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {popularMovies.map((movie) => (
            <MediaCard key={movie.id} media={movie} type="movie" />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">مسلسلات رائجة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {popularTv.map((show) => (
            <MediaCard key={show.id} media={show} type="tv" />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">أعلى تقييماً (أفلام)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {topRatedMovies.map((movie) => (
            <MediaCard key={movie.id} media={movie} type="movie" />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">أعلى تقييماً (مسلسلات)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {topRatedTv.map((show) => (
            <MediaCard key={show.id} media={show} type="tv" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">قادم قريباً (أفلام)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {upcoming.map((movie) => (
            <MediaCard key={movie.id} media={movie} type="movie" />
          ))}
        </div>
      </section>
    </div>
  );
}
