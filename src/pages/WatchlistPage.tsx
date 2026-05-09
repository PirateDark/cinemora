import { useWatchlist } from "../hooks/useWatchlist";
import MediaCard from "../components/MediaCard";
import EmptyState from "../components/EmptyState";
import { Bookmark, Trash2 } from "lucide-react";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  if (watchlist.length === 0) {
    return (
      <EmptyState
        title="قائمة المشاهدة فارغة"
        message="أضف أفلامك أو مسلسلاتك لمشاهدتها لاحقاً"
        icon={<Bookmark className="w-16 h-16 text-gray-600" />}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">قائمة المشاهدة</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {watchlist.map((item: import("../types").MediaItem) => (
          <div key={item.id || item.mal_id} className="relative group">
            <MediaCard
              media={{
                id: item.id || item.mal_id,
                title: item.title || item.name || "",
                name: item.name || item.title || "",
                poster_path: item.poster_path || "",
                vote_average: item.vote_average || item.score || 0,
                overview: item.overview || "",
                release_date: item.release_date || "",
                genre_ids: item.genre_ids || [],
              }}
              type={item.type === "tv" ? "tv" : "movie"}
            />
            <button
              onClick={() => removeFromWatchlist(item.id || item.mal_id)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
              title="حذف من القائمة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
