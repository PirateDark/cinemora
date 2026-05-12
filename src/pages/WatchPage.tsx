import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Home, Film, AlertCircle, RefreshCw, Server, Globe, ChevronLeft, Play, Star, Calendar, Sparkles } from "lucide-react";
import { getMovieDetails, getTvShowDetails, getSeasonDetails } from "../services/tmdbApi";
import { getVideoSources } from "../services/proxyApi";
import MediaInfo from "../components/MediaInfo";
import EpisodeSelector from "../components/EpisodeSelector";
import VideoPlayer from "../components/VideoPlayer";
import WatchPageSkeleton from "../components/WatchPageSkeleton";
import SEO from "../components/SEO";
import { addToWatchHistory } from "../hooks/useWatchHistory";

interface ServerInfo {
  server: string;
  label: string;
  url: string;
  type: string;
  priority: number;
}

interface Season {
  season_number: number;
  episode_count: number;
  name: string;
}

interface Episode {
  episode_number: number;
  name: string;
  still_path?: string;
  overview?: string;
}

interface MediaDetails {
  title: string;
  poster: string;
  year: string;
  rating: string;
  overview: string;
  genres: string[];
}

const ARABIC_SERVERS = new Set(["arabseed", "akwam", "custom"]);

export default function WatchPage() {
  const { type, id, season: seasonParam, episode: episodeParam } = useParams();
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(parseInt(seasonParam || "1"));
  const [selectedEpisode, setSelectedEpisode] = useState<number>(parseInt(episodeParam || "1"));
  const [loading, setLoading] = useState(true);
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);

  const isMovie = type === "movie";
  const mediaId = parseInt(id || "0");
  const [allServers, setAllServers] = useState<ServerInfo[]>([]);
  const [activeServer, setActiveServer] = useState<ServerInfo | null>(null);
  const [loadingSources, setLoadingSources] = useState(true);
  const [embedFailed, setEmbedFailed] = useState(false);

  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(10);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();
  const [watchedAdded, setWatchedAdded] = useState(false);

  const arabicServers = allServers.filter(s => ARABIC_SERVERS.has(s.server));
  const globalServers = allServers.filter(s => !ARABIC_SERVERS.has(s.server));

  const nextEpisode = !isMovie ? selectedEpisode + 1 : null;
  const hasNextEpisode = !isMovie && episodes.length > 0 && nextEpisode !== null && nextEpisode <= episodes.length;

  useEffect(() => {
    setEmbedFailed(false);
    setActiveServer(null);
    setAllServers([]);
    setShowNextEpisode(false);
    setWatchedAdded(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, [id, selectedSeason, selectedEpisode]);

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
          if (!isMovie && data.seasons) setSeasons(data.seasons);
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
      } catch {}
    };
    fetchEpisodes();
  }, [isMovie, mediaId, selectedSeason]);

  useEffect(() => {
    const fetchSources = async () => {
      setLoadingSources(true);
      const result = await getVideoSources(
        isMovie ? "movie" : "tv",
        id || "",
        isMovie ? undefined : selectedSeason,
        isMovie ? undefined : selectedEpisode,
      );
      if (result.sources?.length) {
        const sorted = result.sources.sort((a, b) => a.priority - b.priority);
        setAllServers(sorted);
        setActiveServer(sorted[0]);
      }
      setLoadingSources(false);
    };
    if (id) fetchSources();
  }, [isMovie, id, selectedSeason, selectedEpisode]);

  useEffect(() => {
    if (!mediaDetails || watchedAdded) return;
    const timer = setTimeout(() => {
      addToWatchHistory({
        id: mediaId,
        type: isMovie ? "movie" : "tv",
        title: mediaDetails.title,
        poster_path: mediaDetails.poster.replace("https://image.tmdb.org/t/p/w200", ""),
      });
      setWatchedAdded(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, [mediaDetails, watchedAdded, mediaId, isMovie]);

  const handleEpisodeChange = useCallback((ep: number) => {
    setSelectedEpisode(ep);
    setShowNextEpisode(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    navigate(`/watch/tv/${id}/${selectedSeason}/${ep}`, { replace: true });
  }, [id, selectedSeason, navigate]);

  const startNextEpisodeCountdown = useCallback(() => {
    if (!hasNextEpisode || !nextEpisode) return;
    setShowNextEpisode(true);
    setNextCountdown(10);
    countdownRef.current = setInterval(() => {
      setNextCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          handleEpisodeChange(nextEpisode);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [hasNextEpisode, nextEpisode, handleEpisodeChange]);

  const cancelNext = () => {
    setShowNextEpisode(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const nextEpisodeData = hasNextEpisode && nextEpisode
    ? episodes.find(e => e.episode_number === nextEpisode)
    : null;

  const currentEmbedUrl = activeServer?.type === "iframe" ? activeServer.url : null;
  const currentM3u8Url = activeServer?.type === "m3u8" ? activeServer.url : null;

  if (loading) {
    return <WatchPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <SEO
        title={mediaDetails ? `مشاهدة ${mediaDetails.title}${!isMovie ? ` - حلقة ${selectedEpisode}` : ""}` : "مشاهدة"}
        description={mediaDetails?.overview ? `شاهد ${mediaDetails.title} - ${mediaDetails.overview.slice(0, 160)}` : undefined}
        keywords={`${mediaDetails?.title || ""}, ${isMovie ? "فيلم" : "مسلسل"}, مشاهدة, اونلاين, ${(mediaDetails?.genres || []).join(", ")}`}
        image={mediaDetails?.poster ? mediaDetails.poster.replace("w200", "w500") : undefined}
        url={`${window.location.origin}/watch/${type}/${id}${!isMovie ? `/${selectedSeason}/${selectedEpisode}` : ""}`}
        type={isMovie ? "video.movie" : "video.tv_show"}
      />

      {/* Ambient Background from Poster */}
      {mediaDetails?.poster && (
        <div className="fixed inset-0 -z-10 opacity-[0.04] pointer-events-none">
          <img src={mediaDetails.poster.replace("w200", "original")} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pt-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-rose-400 transition flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> الرئيسية
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <Link to={`/${type}/${id}`} className="hover:text-rose-400 transition flex items-center gap-1">
            <Film className="w-3.5 h-3.5" /> {mediaDetails?.title || "التفاصيل"}
          </Link>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pb-8">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Main: Video Player */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              {embedFailed && (!activeServer || allServers.length === 0) ? (
                <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-6">
                  <AlertCircle className="w-14 h-14 text-rose-500 mb-3" />
                  <p className="text-white font-bold text-lg mb-1">تعذر تحميل الفيديو</p>
                  <p className="text-gray-400 text-sm mb-4">جميع المصادر غير متاحة حالياً</p>
                  <button
                    onClick={() => { setEmbedFailed(false); setLoadingSources(true); getVideoSources(isMovie ? "movie" : "tv", id || "").then(r => { if (r.sources?.length) setAllServers(r.sources.sort((a,b) => a.priority - b.priority)); setLoadingSources(false); }); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl text-sm font-bold transition shadow-lg shadow-rose-600/20"
                  >
                    <RefreshCw className="w-4 h-4" /> إعادة المحاولة
                  </button>
                </div>
              ) : loadingSources ? (
                <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-rose-500 mb-3 mx-auto" />
                    <p className="text-gray-500 text-sm">جاري تحميل المصادر...</p>
                  </div>
                </div>
              ) : currentEmbedUrl ? (
                <VideoPlayer key={`embed-${activeServer?.url}`} src={currentEmbedUrl} sourceName={activeServer?.label} type="iframe" />
              ) : currentM3u8Url ? (
                <VideoPlayer key={`hls-${activeServer?.url}`} src={currentM3u8Url} sourceName={activeServer?.label} type="m3u8" />
              ) : (
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800">
                  <div className="text-center">
                    <Server className="w-12 h-12 text-gray-700 mb-3 mx-auto" />
                    <p className="text-gray-500">لا توجد مصادر متاحة لهذا المحتوى</p>
                  </div>
                </div>
              )}

              {/* Next Episode Overlay */}
              {showNextEpisode && nextEpisode && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-40 animate-fadeIn">
                  <div className="text-center p-8 max-w-sm">
                    <Sparkles className="w-8 h-8 text-rose-400 mx-auto mb-3" />
                    <p className="text-white font-bold text-lg mb-1">الحلقة التالية</p>
                    <p className="text-gray-400 text-sm mb-1">
                      {nextEpisodeData?.name || `الحلقة ${nextEpisode}`}
                    </p>
                    <p className="text-rose-400 text-xs mb-5">التشغيل تلقائياً بعد {nextCountdown} ثوانٍ</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleEpisodeChange(nextEpisode)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 rounded-xl text-sm font-bold transition shadow-lg shadow-rose-600/20"
                      >
                        <Play className="w-4 h-4" /> تشغيل الآن
                      </button>
                      <button
                        onClick={cancelNext}
                        className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-bold transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Title Bar */}
            {mediaDetails && (
              <div className="flex items-center justify-between mt-4 mb-2">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-white">
                    {mediaDetails.title}
                    {!isMovie && (
                      <span className="text-base text-gray-400 font-normal mr-2">
                        - الحلقة {selectedEpisode}
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {mediaDetails.year}
                    </span>
                    {mediaDetails.rating !== "0" && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {mediaDetails.rating}
                      </span>
                    )}
                    {!isMovie && hasNextEpisode && (
                      <button
                        onClick={() => handleEpisodeChange(nextEpisode!)}
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> الحلقة التالية
                      </button>
                    )}
                  </div>
                </div>
                {activeServer && (
                  <div className="hidden sm:flex items-center gap-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl px-3 py-2">
                    <Server className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs text-gray-300">{activeServer.label}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar: Media Info + Servers */}
          <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0 flex flex-col gap-4">
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

            {/* Server Selector */}
            <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 p-4">
              <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-rose-500" /> السيرفرات
              </h3>

              {loadingSources ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-rose-500" />
                </div>
              ) : allServers.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">لا توجد سيرفرات متاحة</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {arabicServers.length > 0 && (
                    <div>
                      <p className="text-rose-400/80 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> عربية
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {arabicServers.map((srv, i) => (
                          <button
                            key={`ar-${i}`}
                            onClick={() => { setActiveServer(srv); setEmbedFailed(false); }}
                            className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                              activeServer?.url === srv.url
                                ? "bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-600/10"
                                : "bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-transparent hover:border-gray-600"
                            }`}
                          >
                            {srv.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {globalServers.length > 0 && (
                    <div>
                      <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> عالمية
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {globalServers.map((srv, i) => (
                          <button
                            key={`gl-${i}`}
                            onClick={() => { setActiveServer(srv); setEmbedFailed(false); }}
                            className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                              activeServer?.url === srv.url
                                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-600/10"
                                : "bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-transparent hover:border-gray-600"
                            }`}
                          >
                            {srv.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episode Selector for Series */}
        {!isMovie && seasons.length > 0 && (
          <div className="mt-8">
            <EpisodeSelector
              seasons={seasons}
              episodes={episodes}
              selectedSeason={selectedSeason}
              selectedEpisode={selectedEpisode}
              onSeasonChange={(s) => { setSelectedSeason(s); setSelectedEpisode(1); }}
              onEpisodeChange={handleEpisodeChange}
              onNextEpisode={hasNextEpisode ? () => startNextEpisodeCountdown() : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
