import { useState, useEffect, useCallback } from "react";
import { MediaItem } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { fetchWatchlist as vpsFetchWatchlist, addToWatchlist as vpsAddWatchlist, removeFromWatchlist as vpsRemoveWatchlist } from "../services/vpsApi";

export function useWatchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (user) {
      vpsFetchWatchlist().then((items) => {
        const mapped: MediaItem[] = items.map((item: any) => {
          const m = item.media || item;
          return {
            id: parseInt(m.tmdbId) || m.id,
            mal_id: parseInt(m.tmdbId) || m.id,
            title: m.title || m.arabicTitle,
            name: m.title || m.arabicTitle,
            poster_path: m.posterPath || m.poster_path,
            vote_average: m.rating || 0,
            category: m.category,
            type: m.category === "series" ? "tv" : "movie",
          };
        });
        setWatchlist(mapped);
      });
    } else {
      const stored = localStorage.getItem("watchlist");
      if (stored) {
        try { setWatchlist(JSON.parse(stored)); } catch {}
      }
    }
  }, [user]);

  const normalizeId = (id: number | string): number => {
    return typeof id === "number" ? id : parseInt(String(id), 10);
  };

  const addToWatchlist = useCallback(async (item: MediaItem) => {
    const itemId = normalizeId(item.mal_id);
    const exists = watchlist.some((a) => normalizeId(a.mal_id) === itemId);
    if (exists) return;

    if (user) {
      await vpsAddWatchlist(String(itemId));
      const fresh = await vpsFetchWatchlist();
      const mapped: MediaItem[] = fresh.map((i: any) => {
        const m = i.media || i;
        return {
          id: parseInt(m.tmdbId) || m.id,
          mal_id: parseInt(m.tmdbId) || m.id,
          title: m.title || m.arabicTitle,
          name: m.title || m.arabicTitle,
          poster_path: m.posterPath || m.poster_path,
          vote_average: m.rating || 0,
          category: m.category,
          type: m.category === "series" ? "tv" : "movie",
        };
      });
      setWatchlist(mapped);
    } else {
      const normalized = { ...item, mal_id: itemId };
      const newList = [...watchlist, normalized];
      setWatchlist(newList);
      localStorage.setItem("watchlist", JSON.stringify(newList));
    }
  }, [watchlist, user]);

  const removeFromWatchlist = useCallback(async (id: number | string) => {
    const targetId = normalizeId(id);
    if (user) {
      await vpsRemoveWatchlist(String(targetId));
      setWatchlist((prev) => prev.filter((a) => normalizeId(a.mal_id) !== targetId));
    } else {
      const newList = watchlist.filter((a) => normalizeId(a.mal_id) !== targetId);
      setWatchlist(newList);
      localStorage.setItem("watchlist", JSON.stringify(newList));
    }
  }, [watchlist, user]);

  const isInWatchlist = (id: number | string) => {
    const targetId = normalizeId(id);
    return watchlist.some((a) => normalizeId(a.mal_id) === targetId);
  };

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}
