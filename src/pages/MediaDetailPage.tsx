import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Star,
  Calendar,
  Clock,
  Play,
  Youtube,
  X,
  Download,
  Share2,
  Users,
} from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useWatchlist } from "../hooks/useWatchlist";
import { useRatings } from "../hooks/useRatings";
import { addToWatchHistory } from "../hooks/useWatchHistory";
import RatingSystem from "../components/RatingSystem";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import MediaCard from "../components/MediaCard";
import LazyImage from "../components/LazyImage";
import {
  getMovieDetails,
  getTvShowDetails,
  getOfficialTrailerKey,
  getSimilarMovies,
  getSimilarTvShows,
  getCredits,
} from "../services/tmdbApi";
import { getVideoSource } from "../services/proxyApi";
import { useToast } from "../components/Toast";
import SEO from "../components/SEO";

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || "";

interface Genre {
  id: number;
  name: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface MediaDetail {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  number_of_seasons?: number;
  genres?: Genre[];
}

export default function MediaDetailPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ type?: string; id?: string }>();

  let type = params.type;
  let id = params.id;

  if (!type || !id) {
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      type = pathParts[0];
      id = pathParts[1];
    }
  }

  const [media, setMedia] = useState<MediaDetail | null>(null);
  const [similar, setSimilar] = useState<MediaDetail[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [favCount, setFavCount] = useState<number | null>(null);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { getRating, setRating, removeRating, getAverageRating, getTotalRatings } = useRatings();

  const isValidType = type === "movie" || type === "tv";
  const mediaId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    setMedia(null);
    setSimilar([]);
    setCast([]);
    setTrailerKey(null);
    setErrorMsg("");
    setLoading(true);
    setShowTrailerModal(false);
    setFavCount(null);
  }, [mediaId, type]);

  const isMovie = type === "movie";
  const mediaType: "movie" | "tv" = isMovie ? "movie" : "tv";

  useEffect(() => {
    const fetchMedia = async () => {
      if (!isValidType || isNaN(mediaId)) return;
      if (media && media.id === mediaId) return;
      setLoading(true);
      setErrorMsg("");
      try {
        const [data, similarData, castData] = await Promise.all([
          isMovie ? getMovieDetails(mediaId) : getTvShowDetails(mediaId),
          isMovie ? getSimilarMovies(mediaId) : getSimilarTvShows(mediaId),
          getCredits(isMovie ? "movie" : "tv", mediaId),
        ]);
        if (data) {
          setMedia(data);
          setSimilar(similarData || []);
          setCast(castData || []);
          addToWatchHistory({
            id: data.id,
            type: isMovie ? "movie" : "tv",
            title: isMovie ? data.title : data.name,
            poster_path: data.poster_path,
          });
        } else {
          setErrorMsg("لم يتم العثور على بيانات");
        }
      } catch (err) {
        console.error("API Error:", err);
        setErrorMsg(err instanceof Error ? err.message : "فشل الاتصال بـ TMDB");
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
    window.scrollTo(0, 0);
  }, [mediaId, isMovie, media, isValidType]);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!mediaId || !isValidType) return;
      try {
        const key = await getOfficialTrailerKey(
          isMovie ? "movie" : "tv",
          mediaId,
        );
        setTrailerKey(key);
      } catch (err) {
        console.error("Error fetching trailer:", err);
        setTrailerKey(null);
      }
    };
    if (mediaId && !loading) {
      fetchTrailer();
    }
  }, [mediaId, isMovie, loading, isValidType]);

  useEffect(() => {
    const fetchFavCount = async () => {
      if (!mediaId || !ENGINE_URL) return;
      try {
        const res = await fetch(`${ENGINE_URL}/api/media/favorites/count/${mediaId}`);
        const data = await res.json();
        if (data.success) setFavCount(data.count);
      } catch {}
    };
    if (!loading && media) fetchFavCount();
  }, [mediaId, loading, media]);

  if (!isValidType || isNaN(mediaId)) {
    return <ErrorState message={`رابط غير صالح: /${type}/${id}`} />;
  }

  const handleFavorite = () => {
    if (!media) return;
    const item = {
      id: mediaId,
      mal_id: mediaId,
      title: isMovie ? media.title : media.name,
      name: isMovie ? media.title : media.name,
      poster_path: media.poster_path || "",
      backdrop_path: media.backdrop_path || "",
      vote_average: media.vote_average || 0,
      overview: media.overview || "",
      release_date: media.release_date || media.first_air_date || "",
      genre_ids: media.genres?.map((g: Genre) => g.id) || [],
      type: mediaType,
      score: media.vote_average,
      images: {
        jpg: {
          image_url: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
          large_image_url: `https://image.tmdb.org/t/p/original${media.backdrop_path || media.poster_path}`,
        },
      },
    };
    if (isFavorite(mediaId)) removeFavorite(mediaId);
    else addFavorite(item);
    setTimeout(() => setFavCount(prev => prev !== null ? (isFavorite(mediaId) ? Math.max(0, prev - 1) : prev + 1) : prev), 200);
  };

  const handleWatchlist = () => {
    if (!media) return;
    const item = {
      id: mediaId,
      mal_id: mediaId,
      title: isMovie ? media.title : media.name,
      name: isMovie ? media.title : media.name,
      poster_path: media.poster_path || "",
      backdrop_path: media.backdrop_path || "",
      vote_average: media.vote_average || 0,
      overview: media.overview || "",
      release_date: media.release_date || media.first_air_date || "",
      genre_ids: media.genres?.map((g: Genre) => g.id) || [],
      type: mediaType,
      score: media.vote_average,
      images: {
        jpg: {
          image_url: `https://image.tmdb.org/t/p/w500${media.poster_path}`,
          large_image_url: `https://image.tmdb.org/t/p/original${media.backdrop_path || media.poster_path}`,
        },
      },
    };
    if (isInWatchlist(mediaId)) removeFromWatchlist(mediaId);
    else addToWatchlist(item);
  };

  const handleWatch = () => {
    if (isMovie) navigate(`/watch/movie/${id}`);
    else navigate(`/watch/tv/${id}/1/1`);
  };

  const handleDownload = async () => {
    setDownloading(true);
    const videoSource = await getVideoSource(
      isMovie ? "movie" : "tv",
      id!,
      !isMovie ? 1 : undefined,
      !isMovie ? 1 : undefined,
    );
    if (videoSource?.url) window.open(videoSource.url, "_blank");
    else toast("لم يتم العثور على رابط للتحميل");
    setDownloading(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast("تم نسخ الرابط!");
    } catch {
      toast("فشل نسخ الرابط");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (errorMsg) return <ErrorState message={errorMsg} />;
  if (!media) return <ErrorState message="لا توجد بيانات" />;

  const title = isMovie ? media.title : media.name;
  const overview = media.overview;
  const genres = media.genres;
  const posterPath = media.poster_path;
  const backdropPath = media.backdrop_path;
  const voteAverage = media.vote_average;
  const releaseDate = isMovie ? media.release_date : media.first_air_date;
  const numberOfSeasons = !isMovie ? media.number_of_seasons : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <SEO title={isMovie ? media.title || "" : media.name || ""} />

      {/* Hero Section with Backdrop */}
      <div className="relative rounded-3xl overflow-hidden mb-10 min-h-[70vh] md:min-h-[60vh] flex items-end shadow-2xl">
        <div className="absolute inset-0 w-full h-full">
          <LazyImage
            src={`https://image.tmdb.org/t/p/w1280${backdropPath || posterPath}`}
            alt={title}
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 p-6 md:p-10 w-full">
          <LazyImage
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            className="w-36 md:w-56 rounded-2xl shadow-2xl shadow-rose-500/10 -mb-16 md:-mb-20 border border-gray-800/50 shrink-0"
          />
          <div className="flex-1 text-center md:text-right pb-2 md:pb-4">
            <h1 className="text-2xl md:text-5xl font-black mb-2 drop-shadow-2xl">{title}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4 text-sm">
              <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-400 font-bold">{voteAverage?.toFixed(1)}</span>
              </div>
              {releaseDate && (
                <div className="flex items-center gap-1 bg-gray-800/50 px-2.5 py-1 rounded-full">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{new Date(releaseDate).getFullYear()}</span>
                </div>
              )}
              {numberOfSeasons && (
                <div className="flex items-center gap-1 bg-gray-800/50 px-2.5 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{numberOfSeasons} مواسم</span>
                </div>
              )}
              {favCount !== null && (
                <div className="flex items-center gap-1 bg-rose-600/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-400 font-bold">{favCount}</span>
                  <span className="text-rose-400/70 text-xs">مفضلة</span>
                </div>
              )}
            </div>
            {genres && genres.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {genres.map((g: Genre) => (
                  <span key={g.id} className="bg-gray-800/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs border border-gray-700/30">
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-300 leading-relaxed max-w-2xl text-sm md:text-base line-clamp-3">
              {overview || "لا يوجد وصف"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-10">
        <button
          onClick={handleWatch}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-600/30"
        >
          <Play className="w-5 h-5 fill-white" /> مشاهدة
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Download className="w-5 h-5" />
          {downloading ? "جاري التجهيز..." : "تحميل"}
        </button>
        {trailerKey && (
          <button
            onClick={() => setShowTrailerModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Youtube className="w-5 h-5" /> إعلان
          </button>
        )}
        <button
          onClick={handleFavorite}
          className="flex items-center gap-2 bg-gray-800 hover:bg-rose-600/80 px-5 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border border-gray-700/50"
        >
          <Heart className={`w-5 h-5 ${isFavorite(mediaId) ? "fill-rose-500 text-rose-500" : ""}`} />
          {isFavorite(mediaId) ? "تمت الإضافة" : "أضف للمفضلة"}
        </button>
        <button
          onClick={handleWatchlist}
          className="flex items-center gap-2 bg-gray-800 hover:bg-blue-600/80 px-5 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border border-gray-700/50"
        >
          <Bookmark className={`w-5 h-5 ${isInWatchlist(mediaId) ? "fill-blue-500 text-blue-500" : ""}`} />
          {isInWatchlist(mediaId) ? "في قائمتي" : "أضف للمشاهدة"}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-gray-800 hover:bg-emerald-600/80 px-5 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 border border-gray-700/50"
        >
          <Share2 className="w-5 h-5" />
          مشاركة
        </button>
        <div className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/30 px-4 py-2 rounded-xl">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-gray-500 font-medium">تقييمك</span>
            <span className="text-[10px] text-gray-600">
              معدلك: {getAverageRating()} ({getTotalRatings()})
            </span>
          </div>
          <RatingSystem
            initialScore={getRating(mediaId)}
            onRate={(s) => setRating(mediaId, s)}
            onRemove={() => removeRating(mediaId)}
            size="sm"
          />
        </div>
      </div>

      {/* Cast Section */}
      {cast.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-black mb-5 flex items-center gap-2">
            <Users className="w-6 h-6 text-rose-400" />
            الممثلين
          </h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2">
            {cast.slice(0, 20).map((actor: CastMember) => (
              <div key={actor.id} className="flex-shrink-0 w-28 md:w-32 text-center group">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 mb-2 border border-gray-800/50 transition-all duration-300 group-hover:border-rose-500/30 group-hover:shadow-lg group-hover:shadow-rose-500/10">
                  <LazyImage
                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "https://via.placeholder.com/100x150?text=?"}
                    alt={actor.name}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs font-bold line-clamp-1">{actor.name}</p>
                <p className="text-[10px] text-gray-500 line-clamp-1">{actor.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Section */}
      {similar.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-black mb-5">
            {isMovie ? "أفلام مشابهة" : "مسلسلات مشابهة"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similar.map((item: MediaDetail) => (
              <MediaCard key={item.id} media={item} type={isMovie ? "movie" : "tv"} />
            ))}
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailerModal && trailerKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
