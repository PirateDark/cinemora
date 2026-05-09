import { useState, useEffect } from "react";

interface WatchHistoryItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string;
  watchedAt: number;
}

export function useContinueWatching() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("watch_history");
    if (stored) {
      setItems(JSON.parse(stored).slice(0, 10));
    }
  }, []);

  return items;
}
