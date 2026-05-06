import { useState, useEffect } from "react";

// التصنيفات غير المناسبة للعائلة
export const FAMILY_UNSAFE_GENRES = [
  { id: 27, name: "رعب", category: "horror" },
  { id: 53, name: "إثارة", category: "thriller" },
  { id: 10749, name: "رومانسية", category: "romance" },
  { id: 10752, name: "حربي", category: "war" },
  { id: 80, name: "جريمة", category: "crime" },
];

interface FamilyModeSettings {
  enabled: boolean;
  blockAdult: boolean;
  blockedGenres: number[];
}

const DEFAULT_SETTINGS: FamilyModeSettings = {
  enabled: false,
  blockAdult: true,
  blockedGenres: [27, 53, 10749],
};

export function useFamilyMode() {
  const [settings, setSettings] =
    useState<FamilyModeSettings>(DEFAULT_SETTINGS);

  // تحميل الإعدادات من localStorage
  useEffect(() => {
    const stored = localStorage.getItem("familyModeSettings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      } catch (e) {
        console.error("فشل تحميل إعدادات الوضع العائلي", e);
      }
    }
  }, []);

  // حفظ الإعدادات (بدون إعادة تحميل تلقائي)
  const updateSettings = (newSettings: FamilyModeSettings) => {
    setSettings(newSettings);
    localStorage.setItem("familyModeSettings", JSON.stringify(newSettings));
  };

  // تبديل تفعيل الوضع العائلي (للزر السريع)
  const toggleEnabled = () => {
    const newSettings = { ...settings, enabled: !settings.enabled };
    setSettings(newSettings);
    localStorage.setItem("familyModeSettings", JSON.stringify(newSettings));
    // إعادة تحميل الصفحة لتطبيق الفلترة على جميع البطاقات
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, 50);
  };

  // التحقق مما إذا كان المحتوى غير مناسب للعائلة
  const isNotFamilyFriendly = (media: any): boolean => {
    if (!settings.enabled) return false;

    // فحص المحتوى للكبار
    if (settings.blockAdult && media.adult === true) return true;

    // فحص التصنيفات الممنوعة
    if (media.genre_ids && settings.blockedGenres.length > 0) {
      const hasBlockedGenre = media.genre_ids.some((id: number) =>
        settings.blockedGenres.includes(id),
      );
      if (hasBlockedGenre) return true;
    }

    return false;
  };

  return {
    settings,
    updateSettings,
    toggleEnabled,
    isNotFamilyFriendly,
    availableGenres: FAMILY_UNSAFE_GENRES,
  };
}
