import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Home,
  Film,
  Info,
  Star,
  Calendar,
  Server,
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { getVideoSource } from "../services/proxyApi";

const TMDB_API_KEY = "ff54d7a5fdc2ab56530491ac8d378131";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [videoError, setVideoError] = useState<boolean>(false);
  const [loadingVideo, setLoadingVideo] = useState<boolean>(false);
  const [useCustomUrl, setUseCustomUrl] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>("");
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const isMovie: boolean = type === "movie";

  // جلب الفيديو من الـ Proxy
  const loadVideo = async () => {
    setLoadingVideo(true);
    setVideoError(false);

    const url = await getVideoSource(
      isMovie ? "movie" : "tv",
      id!,
      !isMovie ? selectedSeason : undefined,
      !isMovie ? selectedEpisode : undefined,
    );

    if (url && url !== videoSrc) {
      setVideoSrc(url);
      setVideoError(false);
    } else if (!url) {
      setVideoError(true);
    }
    setLoadingVideo(false);
  };

  // تحميل الفيديو عند تغيير المعرف أو الموسم/الحلقة
  useEffect(() => {
    if (!useCustomUrl && id) {
      loadVideo();
    }
  }, [selectedSeason, selectedEpisode, id, isMovie, useCustomUrl]);

  // جلب تفاصيل الفيلم/المسلسل
  useEffect(() => {
    const fetchMediaDetails = async () => {
      try {
        const url = isMovie
          ? `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=ar`
          : `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=ar`;
        const response = await axios.get(url);
        if (response.data) {
          setMediaDetails({
            title: isMovie ? response.data.title : response.data.name,
            poster: response.data.poster_path
              ? `https://image.tmdb.org/t/p/w200${response.data.poster_path}`
              : "",
            year: isMovie
              ? response.data.release_date?.split("-")[0] || "غير معروف"
              : response.data.first_air_date?.split("-")[0] || "غير معروف",
            rating: response.data.vote_average?.toFixed(1) || "0",
            overview: response.data.overview || "لا يوجد وصف متاح",
            genres: response.data.genres?.map((g: any) => g.name) || [],
          });
        }
      } catch (err) {
        console.error("فشل في جلب التفاصيل", err);
      }
    };
    if (id) fetchMediaDetails();
  }, [isMovie, id]);

  // جلب بيانات المسلسل
  useEffect(() => {
    if (isMovie) {
      setLoading(false);
      return;
    }
    const fetchTvDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=ar`,
        );
        setSeasons(response.data.seasons || []);
        setLoading(false);
      } catch (err) {
        console.error("فشل في تحميل بيانات المسلسل", err);
        setLoading(false);
      }
    };
    if (id) fetchTvDetails();
  }, [isMovie, id]);

  // جلب حلقات الموسم
  useEffect(() => {
    if (isMovie || !id) return;
    const fetchEpisodes = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}/season/${selectedSeason}?api_key=${TMDB_API_KEY}&language=ar`,
        );
        setEpisodes(response.data.episodes || []);
      } catch (err) {
        console.error("فشل في تحميل الحلقات", err);
      }
    };
    fetchEpisodes();
  }, [isMovie, id, selectedSeason]);

  const handleCustomUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setVideoSrc(customUrl.trim());
      setUseCustomUrl(true);
      setVideoError(false);
    }
  };

  const switchToProxy = () => {
    setUseCustomUrl(false);
    loadVideo();
  };

  // Video player handlers
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => setVideoError(true));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!isFullscreen) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-6">
        {/* شريط التنقل */}
        <div className="flex justify-between items-center gap-2">
          <Link
            to="/"
            className="text-gray-400 hover:text-rose-500 flex items-center gap-1 transition"
          >
            <Home className="w-4 h-4" /> الرئيسية
          </Link>
          <Link
            to={`/${type}/${id}`}
            className="text-gray-400 hover:text-rose-500 flex items-center gap-1 transition"
          >
            <Film className="w-4 h-4" /> التفاصيل
          </Link>
        </div>

        {/* صف المشغل والمعلومات */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div
              ref={playerContainerRef}
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowControls(false)}
            >
              <div className="relative aspect-video">
                {loadingVideo ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500 mb-4"></div>
                    <p className="text-gray-400">جاري تجهيز الرابط...</p>
                  </div>
                ) : videoError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-center p-6">
                    <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
                    <p className="text-white font-bold text-lg mb-2">
                      ⚠️ فشل تحميل الفيديو
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      يمكنك تجربة رابط مخصص.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setVideoError(false);
                          loadVideo();
                        }}
                        className="px-4 py-2 bg-rose-600 rounded-lg"
                      >
                        إعادة المحاولة
                      </button>
                      <button
                        onClick={() => setUseCustomUrl(true)}
                        className="px-4 py-2 bg-gray-600 rounded-lg"
                      >
                        رابط مخصص
                      </button>
                    </div>
                  </div>
                ) : videoSrc ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full cursor-pointer"
                      src={videoSrc}
                      onTimeUpdate={(e) => {
                        const video = e.currentTarget;
                        if (!isNaN(video.duration)) {
                          setCurrentTime(video.currentTime);
                          setProgress(
                            (video.currentTime / video.duration) * 100,
                          );
                        }
                      }}
                      onDurationChange={(e) =>
                        setDuration(e.currentTarget.duration)
                      }
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onClick={togglePlay}
                      onError={() => setVideoError(true)}
                    />

                    {/* تحكمات المشغل */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
                        showControls || !isPlaying ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className="mb-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={handleProgressChange}
                          className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500"
                        />
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <button
                          onClick={togglePlay}
                          className="text-white hover:text-rose-500 transition-transform hover:scale-110"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={toggleMute}
                            className="text-white hover:text-rose-500 transition"
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div className="text-white text-sm font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        {/* زر الرابط المخصص */}
                        {!useCustomUrl ? (
                          <button
                            onClick={() => setUseCustomUrl(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-sm text-white transition"
                          >
                            <Server className="w-4 h-4" />
                            رابط مخصص
                          </button>
                        ) : (
                          <button
                            onClick={switchToProxy}
                            className="flex items-center gap-2 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 rounded-lg text-sm text-white transition"
                          >
                            <Server className="w-4 h-4" />
                            العودة إلى الـ Proxy
                          </button>
                        )}

                        <button
                          onClick={toggleFullscreen}
                          className="text-white hover:text-rose-500 transition"
                        >
                          {isFullscreen ? (
                            <Minimize className="w-5 h-5" />
                          ) : (
                            <Maximize className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* زر التشغيل المركزي */}
                    {!isPlaying && !showControls && (
                      <button
                        onClick={togglePlay}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-rose-600/90 hover:bg-rose-600 rounded-full p-5 transition-all hover:scale-110"
                      >
                        <Play className="w-8 h-8 text-white" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                    <p className="text-gray-400">
                      انقر على "تشغيل" لبدء المشاهدة
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* نموذج الرابط المخصص */}
            {useCustomUrl && (
              <div className="mt-3 bg-gray-800 rounded-xl p-3">
                <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="أدخل رابط فيديو مباشر (.mp4, .m3u8)..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm"
                  >
                    تشغيل
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* عمود المعلومات الجانبي */}
          <div className="lg:col-span-1">
            {mediaDetails && (
              <div className="bg-gray-800/50 rounded-2xl p-5">
                <div className="flex gap-4">
                  {mediaDetails.poster && (
                    <img
                      src={mediaDetails.poster}
                      alt={mediaDetails.title}
                      className="w-24 h-32 object-cover rounded-lg shadow-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-white mb-2">
                      {mediaDetails.title}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {mediaDetails.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />{" "}
                        {mediaDetails.rating}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {mediaDetails.genres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="text-xs px-2 py-1 bg-gray-700 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
                    >
                      <Info className="w-3 h-3" />{" "}
                      {showDetails ? "إخفاء الوصف" : "عرض الوصف"}
                    </button>
                    {showDetails && (
                      <p className="text-sm text-gray-400 leading-relaxed mt-3 pt-3 border-t border-gray-700">
                        {mediaDetails.overview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* الموسم والحلقة للمسلسلات */}
        {!isMovie && seasons.length > 0 && (
          <div className="bg-gray-800/30 rounded-2xl p-5 mt-2">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(parseInt(e.target.value));
                  setSelectedEpisode(1);
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer pr-10"
              >
                <option>اختر الموسم</option>
                {seasons.map((season) => (
                  <option
                    key={season.season_number}
                    value={season.season_number}
                  >
                    {season.name || `الموسم ${season.season_number}`} (
                    {season.episode_count} حلقة)
                  </option>
                ))}
              </select>

              <select
                value={selectedEpisode}
                onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none cursor-pointer pr-10"
              >
                <option>اختر الحلقة</option>
                {episodes.map((ep) => (
                  <option key={ep.episode_number} value={ep.episode_number}>
                    الحلقة {ep.episode_number}: {ep.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setSelectedEpisode((prev) => Math.max(1, prev - 1))
                  }
                  disabled={selectedEpisode <= 1}
                  className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  السابقة
                </button>
                <button
                  onClick={() =>
                    setSelectedEpisode((prev) =>
                      Math.min(episodes.length, prev + 1),
                    )
                  }
                  disabled={selectedEpisode >= episodes.length}
                  className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
                >
                  التالية
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
