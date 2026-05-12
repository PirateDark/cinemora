import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnimeDetails, getAnimeByGenre } from "../services/anilistApi";
import { AnilistMedia } from "../types/anilist";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import AnimeCard from "../components/AnimeCard";
import SEO from "../components/SEO";
import { useFavorites } from "../hooks/useFavorites";
import { useWatchlist } from "../hooks/useWatchlist";
import { addToWatchHistory } from "../hooks/useWatchHistory";
import { useToast } from "../components/Toast";
import { getVideoSource } from "../services/proxyApi";
import { translateToArabic } from "../utils/translate";
import { Play, Star, Calendar, Clock, Heart, Bookmark, Download } from "lucide-react";

const genreMap: Record<string, string> = {
  Action: "أكشن",
  Adventure: "مغامرة",
  Comedy: "كوميديا",
  Drama: "دراما",
  Fantasy: "خيال",
  Horror: "رعب",
  Romance: "رومانسية",
  SciFi: "خيال علمي",
  SliceOfLife: "شريحة من الحياة",
  Sports: "رياضة",
  Supernatural: "خارق للطبيعة",
  Thriller: "إثارة",
  Mystery: "غموض",
  Psychological: "نفسي",
  Mecha: "ميكا",
  Music: "موسيقى",
  Seinen: "سينين",
  Shounen: "شونين",
  Josei: "جوسي",
  Shoujo: "شوجو",
  Ecchi: "إيتشي",
  Harem: "حريم",
  Isekai: "عالم آخر",
  Magic: "سحر",
  Military: "عسكري",
  Parody: "محاكاة ساخرة",
  Samurai: "ساموراي",
  Space: "فضاء",
  SuperPower: "قوى خارقة",
  Vampire: "مصاص دماء",
  Historical: "تاريخي",
  Demons: "شياطين",
  Kids: "أطفال",
  School: "مدرسة",
  AnimeInfluenced: "متأثر بالأنمي",
};

function translateGenre(genre: string): string {
  return genreMap[genre] || genre;
}

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AnilistMedia | null>(null);
  const [similar, setSimilar] = useState<AnilistMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getAnimeDetails(parseInt(id));
        if (data) {
          setAnime(data);
          addToWatchHistory({
            id: data.idMal || data.id,
            type: "tv",
            title: data.title.english || data.title.romaji || data.title.native || "",
            poster_path: data.coverImage?.large || "",
          });

          const rawDesc = data.description?.replace(/<[^>]*>/g, "") || "";
          if (rawDesc) translateToArabic(rawDesc).then(setTranslatedDesc);

          const genre = data.genres?.[0];
          if (genre) {
            const similarData = await getAnimeByGenre(genre, 1, 12);
            setSimilar(similarData.filter((a) => a.id !== data.id).slice(0, 12));
          }
        } else {
          setError(true);
        }
      } catch {
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

  const title = anime.title.english || anime.title.romaji || anime.title.native || "بدون عنوان";
  const imageUrl = anime.coverImage?.large || anime.coverImage?.medium || "";
  const bannerUrl = anime.bannerImage || imageUrl;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "?";
  const year = anime.seasonYear || undefined;
  const episodes = anime.episodes || undefined;
  const description = anime.description?.replace(/<[^>]*>/g, "") || "لا يوجد وصف";

  const mediaItem = {
    id: anime.idMal || anime.id,
    mal_id: anime.id,
    title,
    name: title,
    poster_path: anime.coverImage?.large || "",
    backdrop_path: anime.bannerImage || "",
    vote_average: anime.averageScore ? anime.averageScore / 10 : 0,
    overview: description,
    release_date: anime.seasonYear ? `${anime.seasonYear}-01-01` : "",
    genre_ids: [],
    type: "tv" as const,
    score: anime.averageScore || 0,
    images: {
      jpg: {
        image_url: anime.coverImage?.large || "",
        large_image_url: anime.bannerImage || anime.coverImage?.large || "",
      },
    },
  };

  const handleFavorite = () => {
    if (isFavorite(anime.id)) {
      removeFavorite(anime.id);
      toast("تمت الإزالة من المفضلة");
    } else {
      addFavorite(mediaItem);
      toast("تمت الإضافة إلى المفضلة");
    }
  };

  const handleWatchlist = () => {
    if (isInWatchlist(anime.id)) {
      removeFromWatchlist(anime.id);
      toast("تمت الإزالة من قائمة المشاهدة");
    } else {
      addToWatchlist(mediaItem);
      toast("تمت الإضافة إلى قائمة المشاهدة");
    }
  };

  const handleWatch = () => {
    navigate(`/watch/tv/${anime.idMal && anime.idMal > 0 ? anime.idMal : anime.id}/1/1`);
  };

  const handleDownload = async () => {
    setDownloading(true);
    const videoSource = await getVideoSource("tv", String(anime.idMal || anime.id), 1, 1);
    if (videoSource?.url) window.open(videoSource.url, "_blank");
    else toast("لم يتم العثور على رابط للتحميل");
    setDownloading(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <SEO title={title} />
      <div className="relative rounded-xl overflow-hidden bg-gray-900">
        <img
          src={bannerUrl}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 p-4 md:p-6 z-10">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-40 md:w-64 rounded-lg shadow-lg shrink-0"
          />
          <div className="flex-1 text-center md:text-right w-full">
            <h1 className="text-2xl md:text-4xl font-bold mb-3">{title}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">{score}</span>
              </div>
              {year && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>{year}</span>
                </div>
              )}
              {episodes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>{episodes} حلقة</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              <button
                onClick={handleWatch}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition text-sm md:text-base"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5" /> مشاهدة
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg disabled:opacity-50 transition text-sm md:text-base"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
                {downloading ? "جاري التجهيز..." : "تحميل"}
              </button>
              <button
                onClick={handleFavorite}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 px-3 py-2 rounded-lg transition text-sm"
              >
                <Heart className={`w-4 h-4 ${isFavorite(anime.id) ? "fill-white" : ""}`} />
                {isFavorite(anime.id) ? "تمت الإضافة" : "أضف للمفضلة"}
              </button>
              <button
                onClick={handleWatchlist}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition text-sm"
              >
                <Bookmark className={`w-4 h-4 ${isInWatchlist(anime.id) ? "fill-white" : ""}`} />
                {isInWatchlist(anime.id) ? "في قائمة المشاهدة" : "أضف لقائمة المشاهدة"}
              </button>
            </div>
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {anime.genres.map((genre) => (
                  <span key={genre} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                    {translateGenre(genre)}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-300 leading-relaxed text-sm md:text-base text-center md:text-right">
              {translatedDesc || description}
            </p>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">أنمي مشابه</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similar.map((item) => (
              <AnimeCard key={item.id} anime={item} type={item.format === "MOVIE" ? "movie" : "series"} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
