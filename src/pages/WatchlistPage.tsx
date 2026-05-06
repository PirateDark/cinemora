import { useWatchlist } from "../hooks/useWatchlist";
import MediaCard from "../components/MediaCard";
import EmptyState from "../components/EmptyState";
import { Bookmark } from "lucide-react";

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();

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
        {watchlist.map((item) => (
          <MediaCard
            key={item.mal_id}
            media={item}
            type={item.type === "tv" ? "tv" : "movie"}
          />
        ))}
      </div>
    </div>
  );
}
