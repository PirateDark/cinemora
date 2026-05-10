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
  ExternalLink,
  SkipBack,
  SkipForward,
  PictureInPicture2,
  Loader2,
} from "lucide-react";

interface Props {
  src: string;
  poster?: string;
  sourceName?: string;
  type?: "m3u8" | "mp4" | "iframe";
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

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const hlsRef = useRef<any>(null);
  const hideCursorRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setVideoError(false);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setShowSpeedMenu(false);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || !src.endsWith(".m3u8")) return;
    let destroyed = false;
    import("hls.js").then(({ default: Hls }) => {
      if (destroyed || !Hls.isSupported()) return;
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
        if (data.fatal) setVideoError(true);
      });
    });
    return () => {
      destroyed = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  const handleMouseMove = () => {
    setShowControls(true);
    setShowControlsHint(false);
    if (hideCursorRef.current) clearTimeout(hideCursorRef.current);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
    hideCursorRef.current = setTimeout(() => {
      if (isPlaying) containerRef.current?.style.setProperty("cursor", "none");
    }, 4000);
    containerRef.current?.style.setProperty("cursor", "default");
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => setVideoError(true));
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

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

  const togglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {}
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, videoRef.current.duration || 0));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
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

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
          skip(-10);
          break;
        case "arrowright":
          skip(10);
          break;
        case "arrowup":
          if (videoRef.current) {
            const v = Math.min(1, (videoRef.current.volume || 0) + 0.1);
            videoRef.current.volume = v;
            setVolume(v);
          }
          break;
        case "arrowdown":
          if (videoRef.current) {
            const v = Math.max(0, (videoRef.current.volume || 0) - 0.1);
            videoRef.current.volume = v;
            setVolume(v);
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay]);

  const progressBar = progress;

  if (videoError) {
    return (
      <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <p className="text-white font-bold text-lg mb-2">فشل تحميل الفيديو</p>
          <p className="text-gray-400 text-sm mb-4">يمكنك تجربة رابط مخصص أو تغيير السيرفر</p>
          <div className="flex gap-3">
            <button onClick={() => setVideoError(false)} className="px-4 py-2 bg-rose-600 rounded-lg text-sm font-bold transition hover:bg-rose-700">
              إعادة المحاولة
            </button>
            <button onClick={() => setUseCustomUrl(true)} className="px-4 py-2 bg-gray-600 rounded-lg text-sm font-bold transition hover:bg-gray-500">
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
      className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setShowControls(false); containerRef.current?.style.setProperty("cursor", "default"); }}
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
              onWaiting={() => setIsBuffering(true)}
              onCanPlay={() => setIsBuffering(false)}
              onPlaying={() => setIsBuffering(false)}
            />

            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
              </div>
            )}

            {!isPlaying && !showControls && (
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-600/90 hover:bg-rose-600 rounded-full p-5 transition-all hover:scale-110 shadow-2xl"
              >
                <Play className="w-8 h-8 text-white fill-white" />
              </button>
            )}

            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-12 pb-3 px-4 transition-all duration-300 ${
                showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <div className="mb-2.5 group/progress cursor-pointer">
                <div
                  className="relative h-1.5 bg-gray-600/60 rounded-full hover:h-2 transition-all duration-150"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const pct = x / rect.width;
                    const newTime = pct * duration;
                    if (videoRef.current) {
                      videoRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-rose-500 rounded-full transition-all"
                    style={{ width: `${progressBar}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-rose-400 rounded-full shadow-lg shadow-rose-500/40 scale-0 group-hover/progress:scale-100 transition-transform"
                    style={{ right: `${progressBar}%`, marginRight: "-7px" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button onClick={togglePlay} className="text-white hover:text-rose-400 transition-colors p-1">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <button onClick={() => skip(-10)} className="text-white/70 hover:text-white transition-colors p-1" title="رجوع 10 ثواني">
                    <SkipBack className="w-4.5 h-4.5" size={18} />
                  </button>

                  <button onClick={() => skip(10)} className="text-white/70 hover:text-white transition-colors p-1" title="تقدم 10 ثواني">
                    <SkipForward className="w-4.5 h-4.5" size={18} />
                  </button>

                  <div className="flex items-center gap-1.5 mr-2">
                    <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors p-1">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 lg:w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>

                  <span className="text-white/60 text-xs font-medium mr-1 hidden sm:block">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {document.pictureInPictureEnabled && (
                    <button
                      onClick={togglePip}
                      className="text-white/70 hover:text-white transition-colors p-1"
                      title="صورة داخل صورة"
                    >
                      <PictureInPicture2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="text-white/70 hover:text-white transition-colors px-2 py-1 text-xs font-bold rounded hover:bg-white/10"
                      title="سرعة التشغيل"
                    >
                      {playbackRate}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-scaleIn">
                        {SPEEDS.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => changeSpeed(speed)}
                            className={`block w-full text-right px-4 py-2 text-xs font-bold transition hover:bg-gray-800 ${
                              playbackRate === speed ? "text-rose-400 bg-rose-600/10" : "text-white/80"
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!useCustomUrl ? (
                    <button
                      onClick={() => setUseCustomUrl(true)}
                      className="text-white/70 hover:text-white transition-colors px-2 py-1 text-xs rounded hover:bg-white/10"
                      title="رابط مخصص"
                    >
                      <Server className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={switchToProxy}
                      className="text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 text-xs rounded hover:bg-rose-600/10"
                    >
                      <Server className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={toggleFullscreen}
                    className="text-white/70 hover:text-white transition-colors p-1"
                    title="ملء الشاشة"
                  >
                    {isFullscreen ? <Minimize className="w-4.5 h-4.5" size={18} /> : <Maximize className="w-4.5 h-4.5" size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {showControlsHint && !isPlaying && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full animate-fadeIn pointer-events-none whitespace-nowrap">
                مسافة: تشغيل/إيقاف • F: ملء الشاشة • ← →: تخطي • M: كتم
              </div>
            )}

            {useCustomUrl && (
              <div className="absolute top-3 left-3 right-3 z-10 bg-gray-800/95 rounded-xl p-3 backdrop-blur-sm shadow-xl">
                <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="أدخل رابط فيديو مباشر (.mp4, .m3u8)..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    dir="ltr"
                  />
                  <button type="submit" className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm font-bold transition">
                    تشغيل
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
            <p className="text-gray-400">انقر على "تشغيل" لبدء المشاهدة</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoPlayer({ src, poster, sourceName, type: mediaType }: Props) {
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

  if (mediaType === "iframe") {
    return (
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
        <iframe
          src={src}
          className="w-full h-full"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title={sourceName || "video player"}
        />
        {sourceName && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> {sourceName}
            </span>
          </div>
        )}
      </div>
    );
  }

  return <VideoPlayerInner src={src} poster={poster} type={mediaType} />;
}
