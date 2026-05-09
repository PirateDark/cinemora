import { useState, useEffect } from "react";
import { MediaItem } from "../types";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("watchlist");
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch {
        console.error("Failed to parse watchlist");
      }
    }
  }, []);

  const normalizeId = (id: number | string): number => {
    return typeof id === "number" ? id : parseInt(id, 10);
  };

  const addToWatchlist = (item: MediaItem) => {
    const itemId = normalizeId(item.mal_id);
    const exists = watchlist.some((a) => normalizeId(a.mal_id) === itemId);
    if (!exists) {
      const normalized = { ...item, mal_id: itemId };
      const newList = [...watchlist, normalized];
      setWatchlist(newList);
      localStorage.setItem("watchlist", JSON.stringify(newList));
    }
  };

  const removeFromWatchlist = (id: number | string) => {
    const targetId = normalizeId(id);
    const newList = watchlist.filter((a) => normalizeId(a.mal_id) !== targetId);
    setWatchlist(newList);
    localStorage.setItem("watchlist", JSON.stringify(newList));
  };

  const isInWatchlist = (id: number | string) => {
    const targetId = normalizeId(id);
    return watchlist.some((a) => normalizeId(a.mal_id) === targetId);
  };

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}
