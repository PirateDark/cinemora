import { useState, useEffect } from "react";
import { Anime } from "../types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Anime[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // دالة مساعدة لتحويل id إلى رقم للمقارنة والتخزين
  const normalizeId = (id: number | string): number => {
    return typeof id === "number" ? id : parseInt(id, 10);
  };

  const addFavorite = (anime: Anime) => {
    const animeId = normalizeId(anime.mal_id);
    const exists = favorites.some((a) => normalizeId(a.mal_id) === animeId);
    if (!exists) {
      // تخزين id كرقم إن أمكن
      const normalizedAnime = {
        ...anime,
        mal_id: animeId,
      };
      const newFav = [...favorites, normalizedAnime];
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
