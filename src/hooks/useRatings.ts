import { useState, useCallback } from "react";

const STORAGE_KEY = "user_ratings";

interface RatingEntry {
  mediaId: number;
  score: number;
  timestamp: number;
}

function loadRatings(): Record<number, RatingEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveRatings(data: Record<number, RatingEntry>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useRatings() {
  const [ratings, setRatings] = useState<Record<number, RatingEntry>>(loadRatings);

  const getRating = useCallback((mediaId: number): number | null => {
    return ratings[mediaId]?.score ?? null;
  }, [ratings]);

  const setRating = useCallback((mediaId: number, score: number) => {
    const clamped = Math.max(1, Math.min(5, Math.round(score)));
    const updated = {
      ...ratings,
      [mediaId]: { mediaId, score: clamped, timestamp: Date.now() },
    };
    setRatings(updated);
    saveRatings(updated);
  }, [ratings]);

  const removeRating = useCallback((mediaId: number) => {
    const updated = { ...ratings };
    delete updated[mediaId];
    setRatings(updated);
    saveRatings(updated);
  }, [ratings]);

  const getAllRatings = useCallback((): RatingEntry[] => {
    return Object.values(ratings);
  }, [ratings]);

  const getAverageRating = useCallback((): number => {
    const all = Object.values(ratings);
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, r) => acc + r.score, 0);
    return Math.round((sum / all.length) * 10) / 10;
  }, [ratings]);

  const getTotalRatings = useCallback((): number => {
    return Object.keys(ratings).length;
  }, [ratings]);

  return { getRating, setRating, removeRating, getAllRatings, getAverageRating, getTotalRatings };
}
