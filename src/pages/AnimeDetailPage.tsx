// src/pages/AnimeDetailPage.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAnimeDetails } from "../services/anilistApi";
import { AnilistMedia } from "../types/anilist";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import { Play, Star, Calendar, Clock } from "lucide-react";

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnilistMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getAnimeDetails(parseInt(id));
        if (data) {
          setAnime(data);
          setError(false);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message="فشل تحميل بيانات الأنمي" />;
  if (!anime) return <ErrorState message="لم يتم العثور على الأنمي" />;

  const title =
    anime.title.romaji ||
    anime.title.english ||
    anime.title.native ||
    "بدون عنوان";
  const imageUrl = anime.coverImage?.large || anime.coverImage?.medium || "";
  const bannerUrl = anime.bannerImage || imageUrl;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "?";
  const year = anime.seasonYear || "غير معروف";
  const episodes = anime.episodes || "غير معروف";
  const description =
    anime.description?.replace(/<[^>]*>/g, "") || "لا يوجد وصف";

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative rounded-xl overflow-hidden bg-gray-900">
        <img
          src={bannerUrl}
          alt={title}
          className="w-full h-64 md:h-96 object-cover opacity-30"
        />
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col md:flex-row items-center md:items-start gap-6 p-6">
          <img
            src={imageUrl}
            alt={title}
            className="w-48 md:w-64 rounded-lg shadow-lg"
          />
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{score}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-5 h-5" />
                <span>{year}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>{episodes} حلقة</span>
              </div>
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-gray-800 px-2 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-300 leading-relaxed max-h-40 overflow-y-auto">
              {description}
            </p>

            <div className="mt-6 flex gap-3 flex-wrap">
              <Link
                to="/anime"
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg transition"
              >
                ← العودة إلى الأنمي
              </Link>
              <Link
                to={`/watch/tv/${anime.idMal || anime.id}/1/1`}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg transition"
              >
                <Play className="w-5 h-5" /> مشاهدة الأنمي
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
