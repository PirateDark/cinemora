import { createContext, useContext } from "react";

export const FAMILY_UNSAFE_GENRES = [
  { id: 27, name: "رعب", category: "horror" },
  { id: 53, name: "إثارة", category: "thriller" },
  { id: 10749, name: "رومانسية", category: "romance" },
  { id: 10752, name: "حربي", category: "war" },
  { id: 80, name: "جريمة", category: "crime" },
];

export interface FamilyModeSettings {
  enabled: boolean;
  blockAdult: boolean;
  blockedGenres: number[];
}

export const DEFAULT_SETTINGS: FamilyModeSettings = {
  enabled: false,
  blockAdult: true,
  blockedGenres: [27, 53, 10749],
};

export interface FamilyModeContextValue {
  settings: FamilyModeSettings;
  updateSettings: (settings: FamilyModeSettings) => void;
  toggleEnabled: () => void;
  isNotFamilyFriendly: (media: { adult?: boolean; genre_ids?: number[] }) => boolean;
  availableGenres: typeof FAMILY_UNSAFE_GENRES;
}

export const FamilyModeContext = createContext<FamilyModeContextValue | null>(null);

export function useFamilyMode() {
  const ctx = useContext(FamilyModeContext);
  if (!ctx) throw new Error("useFamilyMode must be used within FamilyModeProvider");
  return ctx;
}
