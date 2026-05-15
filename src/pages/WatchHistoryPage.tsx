import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchWatchHistory } from "../services/vpsApi";
import LazyImage from "../components/LazyImage";
import SEO from "../components/SEO";

interface HistoryItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string;
  watchedAt: number;
}

export default function WatchHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchWatchHistory().then((items) => {
        const mapped: HistoryItem[] = items.map((item: any) => {
          const m = item.media || item;
          return {
            id: parseInt(m.tmdbId) || m.id,
            type: m.category === "series" ? "tv" : "movie",
            title: m.title || m.arabicTitle || "",
            poster_path: m.posterPath || m.poster_path || "",
            watchedAt: new Date(item.updatedAt || item.watchedAt).getTime(),
          };
        });
        setHistory(mapped);
      });
    } else {
      const stored = localStorage.getItem("watch_history");
      if (stored) {
        const parsed: HistoryItem[] = JSON.parse(stored);
        setHistory(parsed.sort((a, b) => b.watchedAt - a.watchedAt));
      }
    }
  }, [user]);

  const removeItem = (id: number, type: string) => {
    const updated = history.filter(
      (item) => !(item.id === id && item.type === type),
    );
    setHistory(updated);
    localStorage.setItem("watch_history", JSON.stringify(updated));
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem("watch_history");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (history.length === 0) {
    return (
      <>
        <SEO title="سجل المشاهدة" />
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Clock className="w-16 h-16 mb-4 opacity-40" />
          <h2 className="text-xl font-semibold mb-2">لا يوجد سجل مشاهدة</h2>
          <p className="text-sm">ستظهر هنا المحتويات التي شاهدتها مؤخراً</p>
        </div>
      </>
    );
  }

  return (
    <div>
      <SEO title="سجل المشاهدة" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🕓 سجل المشاهدة</h1>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 px-4 py-2 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
          مسح الكل
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {history.map((item) => (
          <div key={`${item.type}-${item.id}`} className="relative group">
            <Link to={`/${item.type}/${item.id}`}>
              <div className="rounded-xl overflow-hidden bg-gray-800">
                <LazyImage
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                      : "/placeholder.png"
                  }
                  alt={item.title}
                  aspectRatio="2/3"
                  className="w-full hover:scale-105 transition-transform duration-300 rounded-xl"
                />
              </div>
              <p
                className="mt-2 text-sm text-white font-medium line-clamp-2 text-left"
                dir="ltr"
              >
                {item.title}
              </p>
              <p className="text-xs text-gray-400 mt-1 text-right" dir="rtl">
                {formatDate(item.watchedAt)}
              </p>
            </Link>

            <button
              onClick={() => removeItem(item.id, item.type)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
