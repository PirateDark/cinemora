import { useState, useEffect } from "react";
import { MediaItem } from "../types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<MediaItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        console.error("Failed to parse favorites");
      }
    }
  }, []);

  const normalizeId = (id: number | string): number => {
    return typeof id === "number" ? id : parseInt(id, 10);
  };

  const addFavorite = (item: MediaItem) => {
    const itemId = normalizeId(item.mal_id);
    const exists = favorites.some((a) => normalizeId(a.mal_id) === itemId);
    if (!exists) {
      const normalized = { ...item, mal_id: itemId };
      const newFav = [...favorites, normalized];
      setFavorites(newFav);
      localStorage.setItem("favorites", JSON.stringify(newFav));
    }
  };

  const removeFavorite = (id: number | string) => {
    const targetId = normalizeId(id);
    const newFav = favorites.filter((a) => normalizeId(a.mal_id) !== targetId);
    setFavorites(newFav);
    localStorage.setItem("favorites", JSON.stringify(newFav));
  };

  const isFavorite = (id: number | string) => {
    const targetId = normalizeId(id);
    return favorites.some((a) => normalizeId(a.mal_id) === targetId);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
