import { useState, useEffect, useCallback } from "react";
import { MediaItem } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { fetchFavorites as vpsFetchFavorites, addFavorite as vpsAddFavorite, removeFavorite as vpsRemoveFavorite } from "../services/vpsApi";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (user) {
      vpsFetchFavorites().then((items) => {
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
        setFavorites(mapped);
      });
    } else {
      const stored = localStorage.getItem("favorites");
      if (stored) {
        try { setFavorites(JSON.parse(stored)); } catch {}
      }
    }
  }, [user]);

  const normalizeId = (id: number | string): number => {
    return typeof id === "number" ? id : parseInt(String(id), 10);
  };

  const addFavorite = useCallback(async (item: MediaItem) => {
    const itemId = normalizeId(item.mal_id);
    const exists = favorites.some((a) => normalizeId(a.mal_id) === itemId);
    if (exists) return;

    if (user) {
      await vpsAddFavorite(String(itemId));
      const fresh = await vpsFetchFavorites();
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
      setFavorites(mapped);
    } else {
      const normalized = { ...item, mal_id: itemId };
      const newFav = [...favorites, normalized];
      setFavorites(newFav);
      localStorage.setItem("favorites", JSON.stringify(newFav));
    }
  }, [favorites, user]);

  const removeFavorite = useCallback(async (id: number | string) => {
    const targetId = normalizeId(id);
    if (user) {
      await vpsRemoveFavorite(String(targetId));
      setFavorites((prev) => prev.filter((a) => normalizeId(a.mal_id) !== targetId));
    } else {
      const newFav = favorites.filter((a) => normalizeId(a.mal_id) !== targetId);
      setFavorites(newFav);
      localStorage.setItem("favorites", JSON.stringify(newFav));
    }
  }, [favorites, user]);

  const isFavorite = (id: number | string) => {
    const targetId = normalizeId(id);
    return favorites.some((a) => normalizeId(a.mal_id) === targetId);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
