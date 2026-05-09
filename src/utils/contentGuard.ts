const ANIMATION_GENRE_ID = 16;

export interface TmdbItem {
  genre_ids?: number[];
  origin_country?: string[];
  original_language?: string;
}

export function isAnimationContent(item: TmdbItem): boolean {
  return item.genre_ids?.includes(ANIMATION_GENRE_ID) ?? false;
}

export function isAnimeContent(item: TmdbItem): boolean {
  return (
    isAnimationContent(item) &&
    (item.origin_country?.includes("JP") ?? false)
  );
}

export function isLiveActionAsianContent(item: TmdbItem): boolean {
  return !isAnimationContent(item);
}

export function isArabicContent(item: TmdbItem): boolean {
  return item.original_language === "ar";
}

export function filterLiveAction<T extends TmdbItem>(items: T[]): T[] {
  return items.filter((item) => !isAnimationContent(item));
}
