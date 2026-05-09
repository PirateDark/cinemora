import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  Server,
} from "lucide-react";

interface Props {
  src: string;
  poster?: string;
  sourceName?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function VideoPlayerInner({ src, poster }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [useCustomUrl, setUseCustomUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setVideoError(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, [src]);

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
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
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

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (!isNaN(video.duration)) {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    }
  }, []);

  const handleCustomUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setUseCustomUrl(true);
      setVideoError(false);
    }
  };

  const switchToProxy = () => {
    setUseCustomUrl(false);
    setCustomUrl("");
    setVideoError(false);
  };

  if (videoError) {
    return (
      <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <p className="text-white font-bold text-lg mb-2">⚠️ فشل تحميل الفيديو</p>
          <p className="text-gray-400 text-sm mb-4">يمكنك تجربة رابط مخصص.</p>
          <div className="flex gap-3">
            <button onClick={() => setVideoError(false)} className="px-4 py-2 bg-rose-600 rounded-lg">
              إعادة المحاولة
            </button>
            <button onClick={() => setUseCustomUrl(true)} className="px-4 py-2 bg-gray-600 rounded-lg">
              رابط مخصص
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSrc = useCustomUrl && customUrl.trim() ? customUrl : src;

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative aspect-video">
        {currentSrc ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full cursor-pointer"
              src={currentSrc}
              poster={poster}
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              onError={() => setVideoError(true)}
            />

            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}>
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
                <button onClick={togglePlay} className="text-white hover:text-rose-500 transition-transform hover:scale-110">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>

                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-white hover:text-rose-500 transition">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
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

                {!useCustomUrl ? (
                  <button onClick={() => setUseCustomUrl(true)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 rounded-lg text-sm text-white transition">
                    <Server className="w-4 h-4" /> رابط مخصص
                  </button>
                ) : (
                  <button onClick={switchToProxy} className="flex items-center gap-2 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 rounded-lg text-sm text-white transition">
                    <Server className="w-4 h-4" /> العودة إلى المصادر
                  </button>
                )}

                <button onClick={toggleFullscreen} className="text-white hover:text-rose-500 transition">
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isPlaying && !showControls && (
              <button onClick={togglePlay} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-rose-600/90 hover:bg-rose-600 rounded-full p-5 transition-all hover:scale-110">
                <Play className="w-8 h-8 text-white" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
            <p className="text-gray-400">انقر على "تشغيل" لبدء المشاهدة</p>
          </div>
        )}

        {useCustomUrl && (
          <div className="absolute top-3 left-3 right-3 z-10 bg-gray-800/95 rounded-xl p-3 backdrop-blur-sm">
            <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="أدخل رابط فيديو مباشر (.mp4, .m3u8)..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button type="submit" className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm">
                تشغيل
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoPlayer({ src, poster, sourceName }: Props) {
  if (!src) {
    return (
      <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500 mb-4 mx-auto" />
          <p className="text-gray-400">جاري تجهيز الرابط...</p>
        </div>
      </div>
    );
  }

  return <VideoPlayerInner src={src} poster={poster} sourceName={sourceName} />;
}
