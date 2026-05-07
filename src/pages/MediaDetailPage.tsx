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
} from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useWatchlist } from "../hooks/useWatchlist";
import { addToWatchHistory } from "../hooks/useWatchHistory";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import MediaCard from "../components/MediaCard";
import {
  getMovieDetails,
  getTvShowDetails,
  getOfficialTrailerKey,
  getSimilarMovies,
  getSimilarTvShows,
  getCredits,
} from "../services/tmdbApi";
import { getVideoSource } from "../services/proxyApi";

export default function MediaDetailPage() {
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

  const [media, setMedia] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

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
  }, [mediaId, type]);

  if (!isValidType || isNaN(mediaId)) {
    return <ErrorState message={`رابط غير صالح: /${type}/${id}`} />;
  }

  const isMovie = type === "movie";

  useEffect(() => {
    const fetchMedia = async () => {
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
      } catch (err: any) {
        console.error("API Error:", err);
        setErrorMsg(err.message || "فشل الاتصال بـ TMDB");
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
    window.scrollTo(0, 0);
  }, [mediaId, isMovie, media]);

  useEffect(() => {
    const fetchTrailer = async () => {
      if (!mediaId) return;
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
  }, [mediaId, isMovie, loading]);

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
      genre_ids: media.genres?.map((g: any) => g.id) || [],
      type: isMovie ? "movie" : "tv",
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
      genre_ids: media.genres?.map((g: any) => g.id) || [],
      type: isMovie ? "movie" : "tv",
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
    try {
      const videoUrl = await getVideoSource(
        isMovie ? "movie" : "tv",
        id!,
        !isMovie ? 1 : undefined,
        !isMovie ? 1 : undefined,
      );
      if (videoUrl) window.open(videoUrl, "_blank");
      else alert("لم يتم العثور على رابط للتحميل");
    } catch (error) {
      console.error("Download error:", error);
      alert("حدث خطأ أثناء محاولة التحميل");
    } finally {
      setDownloading(false);
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
      <div className="relative rounded-xl overflow-hidden bg-gray-900">
        <img
          src={`https://image.tmdb.org/t/p/original${backdropPath || posterPath}`}
          alt={title}
          className="w-full h-64 md:h-96 object-cover opacity-30"
        />
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col md:flex-row items-center md:items-start gap-6 p-6">
          <img
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            className="w-48 md:w-64 rounded-lg shadow-lg"
          />
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{voteAverage || "?"}</span>
              </div>
              {releaseDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  <span>{new Date(releaseDate).getFullYear()}</span>
                </div>
              )}
              {numberOfSeasons && (
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  <span>{numberOfSeasons} مواسم</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              <button
                onClick={handleWatch}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg"
              >
                <Play className="w-5 h-5" /> مشاهدة
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {downloading ? "جاري التجهيز..." : "تحميل"}
              </button>
              {trailerKey && (
                <button
                  onClick={() => setShowTrailerModal(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
                >
                  <Youtube className="w-5 h-5" /> عرض المقطع الدعائي
                </button>
              )}
              <button
                onClick={handleFavorite}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg"
              >
                <Heart
                  className={`w-5 h-5 ${isFavorite(mediaId) ? "fill-white" : ""}`}
                />
                {isFavorite(mediaId) ? "تمت الإضافة" : "أضف للمفضلة"}
              </button>
              <button
                onClick={handleWatchlist}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                <Bookmark
                  className={`w-5 h-5 ${isInWatchlist(mediaId) ? "fill-white" : ""}`}
                />
                {isInWatchlist(mediaId)
                  ? "في قائمة المشاهدة"
                  : "أضف لقائمة المشاهدة"}
              </button>
            </div>
            {genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((g: any) => (
                  <span
                    key={g.id}
                    className="bg-gray-800 px-2 py-1 rounded-full text-sm"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-300 leading-relaxed">
              {overview || "لا يوجد وصف"}
            </p>
          </div>
        </div>
      </div>

      {cast.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">طاقم التمثيل</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
            {cast.map((actor: any) => (
              <div key={actor.id} className="text-center">
                <img
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : "https://via.placeholder.com/100x150?text=?"
                  }
                  alt={actor.name}
                  className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/100x150?text=?";
                  }}
                />
                <p className="text-xs font-semibold line-clamp-1">
                  {actor.name}
                </p>
                <p className="text-xs text-gray-400 line-clamp-1">
                  {actor.character}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">
            {isMovie ? "أفلام مشابهة" : "مسلسلات مشابهة"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similar.map((item: any) => (
              <MediaCard
                key={item.id}
                media={item}
                type={isMovie ? "movie" : "tv"}
              />
            ))}
          </div>
        </div>
      )}

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
              className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black text-white p-2 rounded-full"
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
