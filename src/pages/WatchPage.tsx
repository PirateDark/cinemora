import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Home, Film, AlertCircle } from "lucide-react";
import { getVideoSources } from "../services/proxyApi";
import { getMovieDetails, getTvShowDetails, getSeasonDetails } from "../services/tmdbApi";
import VideoPlayer from "../components/VideoPlayer";
import MediaInfo from "../components/MediaInfo";
import EpisodeSelector from "../components/EpisodeSelector";
import SEO from "../components/SEO";

interface Season {
  season_number: number;
  episode_count: number;
  name: string;
}

interface Episode {
  episode_number: number;
  name: string;
  still_path?: string;
}

interface MediaDetails {
  title: string;
  poster: string;
  year: string;
  rating: string;
  overview: string;
  genres: string[];
}

export default function WatchPage() {
  const { type, id, season: seasonParam, episode: episodeParam } = useParams();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    parseInt(seasonParam || "1"),
  );
  const [selectedEpisode, setSelectedEpisode] = useState<number>(
    parseInt(episodeParam || "1"),
  );
  const [loading, setLoading] = useState(true);
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [error, setError] = useState("");

  const isMovie = type === "movie";
  const mediaId = parseInt(id || "0");

  const fetchVideoSource = useCallback(async () => {
    setLoadingVideo(true);
    setError("");
    const sources = await getVideoSources(
      isMovie ? "movie" : "tv",
      id!,
      !isMovie ? selectedSeason : undefined,
      !isMovie ? selectedEpisode : undefined,
    );
    if (sources.length > 0) {
      setVideoSrc(sources[0].url);
      setSourceName(sources[0].name);
    } else {
      setVideoSrc("");
      setSourceName("");
      setError("لا توجد مصادر متاحة لهذا المحتوى حالياً");
    }
    setLoadingVideo(false);
  }, [isMovie, id, selectedSeason, selectedEpisode]);

  useEffect(() => {
    if (!id) return;
    fetchVideoSource();
  }, [fetchVideoSource, id]);

  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const data = isMovie
          ? await getMovieDetails(mediaId)
          : await getTvShowDetails(mediaId);

        if (data) {
          setMediaDetails({
            title: isMovie ? data.title : data.name,
            poster: data.poster_path
              ? `https://image.tmdb.org/t/p/w200${data.poster_path}`
              : "",
            year: isMovie
              ? data.release_date?.split("-")[0] || "غير معروف"
              : data.first_air_date?.split("-")[0] || "غير معروف",
            rating: data.vote_average?.toFixed(1) || "0",
            overview: data.overview || "لا يوجد وصف متاح",
            genres: data.genres?.map((g: { id: number; name: string }) => g.name) || [],
          });
          if (!isMovie && data.seasons) {
            setSeasons(data.seasons);
          }
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    if (mediaId) fetchMediaDetails();
  }, [isMovie, mediaId]);

  useEffect(() => {
    if (isMovie || !mediaId) return;
    const fetchEpisodes = async () => {
      try {
        const data = await getSeasonDetails(mediaId, selectedSeason);
        setEpisodes(data.episodes || []);
      } catch {
        // ignore
      }
    };
    fetchEpisodes();
  }, [isMovie, mediaId, selectedSeason]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <SEO title={mediaDetails ? `مشاهدة ${mediaDetails.title}${!isMovie ? ` - حلقة ${selectedEpisode}` : ""}` : "مشاهدة"} />
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center gap-2">
          <Link to="/" className="text-gray-400 hover:text-rose-500 flex items-center gap-1 transition">
            <Home className="w-4 h-4" /> الرئيسية
          </Link>
          <Link to={`/${type}/${id}`} className="text-gray-400 hover:text-rose-500 flex items-center gap-1 transition">
            <Film className="w-4 h-4" /> التفاصيل
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {error ? (
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                <p className="text-white font-bold text-lg mb-1">{error}</p>
                <button
                  onClick={fetchVideoSource}
                  className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-sm transition"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : loadingVideo ? (
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500 mb-4" />
                <p className="text-gray-400">جاري تجهيز الرابط...</p>
              </div>
            ) : (
              <VideoPlayer
                src={videoSrc}
                sourceName={sourceName}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            {mediaDetails && (
              <MediaInfo
                poster={mediaDetails.poster}
                title={mediaDetails.title}
                year={mediaDetails.year}
                rating={mediaDetails.rating}
                genres={mediaDetails.genres}
                overview={mediaDetails.overview}
              />
            )}
          </div>
        </div>

        {!isMovie && seasons.length > 0 && (
          <EpisodeSelector
            seasons={seasons}
            episodes={episodes}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
            onSeasonChange={setSelectedSeason}
            onEpisodeChange={setSelectedEpisode}
          />
        )}
      </div>
    </div>
  );
}
