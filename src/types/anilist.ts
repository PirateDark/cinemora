// src/types/anilist.ts

export interface AnilistMedia {
  id: number;
  idMal: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    large: string;
    medium: string;
  };
  bannerImage: string | null;
  description: string;
  status: string;
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number;
  format: string;
  genres: string[];
  nextAiringEpisode: {
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
  } | null;
}

export interface AnilistPageInfo {
  total: number;
  perPage: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
}

export interface AnilistResponse {
  Page: {
    pageInfo: AnilistPageInfo;
    media: AnilistMedia[];
  };
}
