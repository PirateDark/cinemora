import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Home, Film, AlertCircle, RefreshCw } from "lucide-react";
import { getMovieDetails, getTvShowDetails, getSeasonDetails } from "../services/tmdbApi";
import MediaInfo from "../components/MediaInfo";
import EpisodeSelector from "../components/EpisodeSelector";
import SEO from "../components/SEO";

const EMBED_SOURCES: ((id: string, type?: string) => string)[] = [
  (id, type) => `https://vidsrc.in/embed/${type}/${id}`,
  (id) => `https://2embed.org/embed/${id}`,
  (id) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
  (id, type) => `https://embed.su/embed/${type}/${id}`,
];

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

  const isMovie = type === "movie";
  const mediaId = parseInt(id || "0");
  const [embedIndex, setEmbedIndex] = useState(0);
  const [embedFailed, setEmbedFailed] = useState(false);

  const getEmbedUrl = useCallback(() => {
    const mediaType = isMovie ? "movie" : "tv";
    const rawId = id || "";
    const factory = EMBED_SOURCES[embedIndex % EMBED_SOURCES.length];
    return factory(rawId, mediaType);
  }, [isMovie, id, embedIndex]);

  useEffect(() => {
    setEmbedFailed(false);
    setEmbedIndex(0);
  }, [id, selectedSeason, selectedEpisode]);

  const retryEmbed = () => {
    setEmbedFailed(false);
    setEmbedIndex(0);
  };

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
            {embedFailed ? (
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                <p className="text-white font-bold text-lg mb-1">تعذر تحميل الفيديو</p>
                <p className="text-gray-400 text-sm mb-4">جميع المصادر غير متاحة حالياً</p>
                <button
                  onClick={retryEmbed}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg text-sm transition"
                >
                  <RefreshCw className="w-4 h-4" /> إعادة المحاولة
                </button>
              </div>
            ) : (
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  key={embedIndex}
                  src={getEmbedUrl()}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title="video player"
                />
                <div className="absolute top-3 left-3 flex gap-2 z-10">
                  <button
                    onClick={() => setEmbedIndex((i) => (i + 1) % EMBED_SOURCES.length)}
                    className="flex items-center gap-1 bg-black/60 hover:bg-rose-600/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    <RefreshCw className="w-3 h-3" /> تغيير المصدر
                  </button>
                  <span className="bg-black/40 backdrop-blur-md text-gray-300 text-xs px-2 py-1.5 rounded-lg">
                    مصدر {embedIndex + 1}/{EMBED_SOURCES.length}
                  </span>
                </div>
              </div>
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
