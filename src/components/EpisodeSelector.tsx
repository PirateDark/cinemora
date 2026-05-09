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

interface EpisodeSelectorProps {
  seasons: Season[];
  episodes: Episode[];
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
}

export default function EpisodeSelector({
  seasons,
  episodes,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
}: EpisodeSelectorProps) {
  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">الحلقات</h3>
        <select
          value={selectedSeason}
          onChange={(e) => {
            onSeasonChange(parseInt(e.target.value));
            onEpisodeChange(1);
          }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
        >
          {seasons.filter(s => s.season_number > 0).map((season) => (
            <option key={season.season_number} value={season.season_number}>
              {season.name || `الموسم ${season.season_number}`}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {episodes.map((ep) => (
          <button
            key={ep.episode_number}
            onClick={() => onEpisodeChange(ep.episode_number)}
            className={`relative group p-3 rounded-xl border transition-all duration-300 text-right overflow-hidden ${
              selectedEpisode === ep.episode_number
                ? "bg-rose-600/20 border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.2)]"
                : "bg-gray-800/40 border-gray-700 hover:border-gray-500"
            }`}
          >
            <div className="relative z-10">
              <span className={`block text-xs mb-1 font-bold ${
                selectedEpisode === ep.episode_number ? "text-rose-400" : "text-gray-500"
              }`}>
                الحلقة {ep.episode_number}
              </span>
              <p className={`text-xs line-clamp-1 font-medium ${
                selectedEpisode === ep.episode_number ? "text-white" : "text-gray-300"
              }`}>
                {ep.name || `الحلقة ${ep.episode_number}`}
              </p>
            </div>
            {selectedEpisode === ep.episode_number && (
              <div className="absolute inset-0 bg-gradient-to-t from-rose-600/10 to-transparent" />
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-2">
        <button
          onClick={() => onEpisodeChange(Math.max(1, selectedEpisode - 1))}
          disabled={selectedEpisode <= 1}
          className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition border border-gray-700 text-sm font-bold"
        >
          الحلقة السابقة
        </button>
        <button
          onClick={() => onEpisodeChange(Math.min(episodes.length, selectedEpisode + 1))}
          disabled={selectedEpisode >= episodes.length}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-bold shadow-lg shadow-rose-600/20"
        >
          الحلقة التالية
        </button>
      </div>
    </div>
  );
}
