import { Play, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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

interface EpisodeSelectorProps {
  seasons: Season[];
  episodes: Episode[];
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
  onNextEpisode?: () => void;
}

export default function EpisodeSelector({
  seasons,
  episodes,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
  onNextEpisode,
}: EpisodeSelectorProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-rose-500" fill="currentColor" /> الحلقات
        </h3>
        <select
          value={selectedSeason}
          onChange={(e) => {
            onSeasonChange(parseInt(e.target.value));
          }}
          className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 appearance-none cursor-pointer"
        >
          {seasons.filter(s => s.season_number > 0).map((season) => (
            <option key={season.season_number} value={season.season_number}>
              {season.name || `الموسم ${season.season_number}`}
            </option>
          ))}
        </select>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {episodes.map((ep) => {
          const isActive = selectedEpisode === ep.episode_number;
          return (
            <button
              key={ep.episode_number}
              onClick={() => onEpisodeChange(ep.episode_number)}
              className={`relative group rounded-xl border transition-all duration-300 overflow-hidden text-right ${
                isActive
                  ? "bg-rose-600/20 border-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.15)]"
                  : "bg-gray-800/40 border-gray-700/60 hover:border-gray-500 hover:bg-gray-800/60"
              }`}
            >
              {/* Episode Thumbnail */}
              <div className="relative aspect-video bg-gray-800 overflow-hidden">
                {ep.still_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                    alt={ep.name || `الحلقة ${ep.episode_number}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className={`w-6 h-6 ${isActive ? "text-rose-500" : "text-gray-700"}`} />
                  </div>
                )}
                {isActive && (
                  <div className="absolute inset-0 bg-rose-600/10 flex items-center justify-center">
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      جاري التشغيل
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-rose-600 text-white"
                      : "bg-black/60 text-gray-300"
                  }`}>
                    {ep.episode_number}
                  </span>
                </div>
              </div>

              {/* Episode Info */}
              <div className="p-2.5">
                <p className={`text-xs font-bold truncate ${
                  isActive ? "text-rose-300" : "text-gray-300 group-hover:text-white"
                }`}>
                  {ep.name || `الحلقة ${ep.episode_number}`}
                </p>
                {ep.overview && (
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {ep.overview}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={() => onEpisodeChange(Math.max(1, selectedEpisode - 1))}
          disabled={selectedEpisode <= 1}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition border border-gray-700 text-sm font-bold"
        >
          <ChevronRight className="w-4 h-4" /> السابقة
        </button>

        {onNextEpisode && selectedEpisode < episodes.length ? (
          <button
            onClick={onNextEpisode}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-l from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl transition text-sm font-bold shadow-lg shadow-rose-600/20 hover:shadow-xl hover:shadow-rose-500/30"
          >
            التالية <Sparkles className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onEpisodeChange(Math.min(episodes.length, selectedEpisode + 1))}
            disabled={selectedEpisode >= episodes.length}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition border border-gray-700 text-sm font-bold"
          >
            التالية <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
