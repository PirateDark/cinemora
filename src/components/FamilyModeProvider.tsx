import { useState, useEffect, ReactNode } from "react";
import { FamilyModeContext, FamilyModeSettings, DEFAULT_SETTINGS, FAMILY_UNSAFE_GENRES } from "../hooks/useFamilyMode";

export function FamilyModeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<FamilyModeSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem("familyModeSettings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("فشل تحميل إعدادات الوضع العائلي", e);
      }
    }
  }, []);

  const updateSettings = (newSettings: FamilyModeSettings) => {
    setSettings(newSettings);
    localStorage.setItem("familyModeSettings", JSON.stringify(newSettings));
  };

  const toggleEnabled = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    localStorage.setItem("familyModeSettings", JSON.stringify(newSettings));
  };

  const isNotFamilyFriendly = (media: { adult?: boolean; genre_ids?: number[] }): boolean => {
    if (!settings.enabled) return false;
    if (settings.blockAdult && media.adult === true) return true;
    if (media.genre_ids && settings.blockedGenres.length > 0) {
      return media.genre_ids.some((id) => settings.blockedGenres.includes(id));
    }
    return false;
  };

  return (
    <FamilyModeContext.Provider
      value={{ settings, updateSettings, toggleEnabled, isNotFamilyFriendly, availableGenres: FAMILY_UNSAFE_GENRES }}
    >
      {children}
    </FamilyModeContext.Provider>
  );
}
