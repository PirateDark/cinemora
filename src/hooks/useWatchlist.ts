import { useState, useEffect } from "react";
import { Anime } from "../types";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Anime[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("watchlist");
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
  }, []);

  // دالة مساعدة لتحويل id إلى رقم للمقارنة والتخزين
  const normalizeId = (id: number | string): number => {
    return typeof id === "number" ? id : parseInt(id, 10);
  };

  const addToWatchlist = (anime: Anime) => {
    const animeId = normalizeId(anime.mal_id);
    const exists = watchlist.some((a) => normalizeId(a.mal_id) === animeId);
    if (!exists) {
      // تخزين id كرقم إن أمكن
      const normalizedAnime = {
        ...anime,
        mal_id: animeId,
      };
      const newList = [...watchlist, normalizedAnime];
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
