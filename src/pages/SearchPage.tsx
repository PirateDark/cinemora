import { useEffect, useState } from "react";
import axios from "axios";
import MediaCard from "../components/MediaCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";

const TMDB_API_KEY = "ff54d7a5fdc2ab56530491ac8d378131";

interface TurkishShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  first_air_date?: string;
  overview_ar: string; // الوصف العربي (سيتم دمجه)
}

export default function TurkishShowsPage() {
  const [shows, setShows] = useState<TurkishShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTurkishShows = async () => {
      try {
        // جلب البيانات بالإنجليزية (للأسماء) والعربية (للوصف)
        const [resEn, resAr] = await Promise.all([
          axios.get(
            `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=TR&sort_by=popularity.desc&language=en`,
          ),
          axios.get(
            `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=TR&sort_by=popularity.desc&language=ar`,
          ),
        ]);

        // دمج البيانات: الاسم من الانجليزي، الوصف من العربي
        const mergedShows = resEn.data.results.map(
          (showEn: any, index: number) => {
            const showAr = resAr.data.results[index] || {};
            return {
              ...showEn,
              name: showEn.name, // الاسم انجليزي
              overview_ar: showAr.overview || showEn.overview, // وصف عربي
            };
          },
        );
        setShows(mergedShows);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTurkishShows();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message="فشل تحميل المسلسلات التركية" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🎭 Turkish TV Shows</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {shows.map((show) => (
          <MediaCard
            key={show.id}
            media={{ ...show, title: show.name, media_type: "tv" }}
            type="tv"
          />
        ))}
      </div>
    </div>
  );
}
