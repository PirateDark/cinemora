// src/services/anilistApi.ts
import axios from "axios";
import { AnilistMedia } from "../types/anilist";

const ANILIST_API_URL = "https://graphql.anilist.co";

// واجهة الاستجابة الفعلية من AniList
interface AnilistRawResponse {
  data: {
    Page: {
      pageInfo: {
        total: number;
        perPage: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
      };
      media: AnilistMedia[];
    };
  };
}

// واجهة الاستجابة للتفاصيل
interface AnilistDetailResponse {
  data: {
    Media: AnilistMedia;
  };
}

// استعلام جلب البيانات (تم إضافة $format)
const GET_ANIME_QUERY = `
  query ($page: Int, $perPage: Int, $type: MediaType, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int, $status: MediaStatus, $format: MediaFormat) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: $type, sort: $sort, season: $season, seasonYear: $seasonYear, status: $status, isAdult: false, format: $format) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        bannerImage
        description
        status
        episodes
        duration
        chapters
        volumes
        season
        seasonYear
        averageScore
        popularity
        format
        genres
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  }
`;

// جلب أحدث الأنمي
export const getTrendingAnime = async (
  page: number = 1,
  perPage: number = 20,
): Promise<AnilistMedia[]> => {
  try {
    const variables = {
      page,
      perPage,
      type: "ANIME",
      sort: ["TRENDING_DESC"],
    };

    const response = await axios.post<AnilistRawResponse>(ANILIST_API_URL, {
      query: GET_ANIME_QUERY,
      variables,
    });

    return response.data.data.Page.media;
  } catch (error) {
    console.error("خطأ في جلب الأنمي الرائج:", error);
    return [];
  }
};

// جلب الأنمي الأكثر شعبية
export const getPopularAnime = async (
  page: number = 1,
  perPage: number = 20,
): Promise<AnilistMedia[]> => {
  try {
    const variables = {
      page,
      perPage,
      type: "ANIME",
      sort: ["POPULARITY_DESC"],
    };

    const response = await axios.post<AnilistRawResponse>(ANILIST_API_URL, {
      query: GET_ANIME_QUERY,
      variables,
    });

    return response.data.data.Page.media;
  } catch (error) {
    console.error("خطأ في جلب الأنمي الأكثر شعبية:", error);
    return [];
  }
};

// جلب الأنمي الأعلى تقييماً
export const getTopRatedAnime = async (
  page: number = 1,
  perPage: number = 20,
): Promise<AnilistMedia[]> => {
  try {
    const variables = {
      page,
      perPage,
      type: "ANIME",
      sort: ["SCORE_DESC"],
    };

    const response = await axios.post<AnilistRawResponse>(ANILIST_API_URL, {
      query: GET_ANIME_QUERY,
      variables,
    });

    return response.data.data.Page.media;
  } catch (error) {
    console.error("خطأ في جلب الأنمي الأعلى تقييماً:", error);
    return [];
  }
};

// جلب الأنمي حسب الموسم
export const getSeasonalAnime = async (
  season: string,
  year: number,
  page: number = 1,
  perPage: number = 20,
): Promise<AnilistMedia[]> => {
  try {
    const variables = {
      page,
      perPage,
      type: "ANIME",
      sort: ["POPULARITY_DESC"],
      season,
      seasonYear: year,
    };

    const response = await axios.post<AnilistRawResponse>(ANILIST_API_URL, {
      query: GET_ANIME_QUERY,
      variables,
    });

    return response.data.data.Page.media;
  } catch (error) {
    console.error("خطأ في جلب الأنمي الموسمي:", error);
    return [];
  }
};

// جلب الأنمي حسب التصنيف
export const getAnimeByGenre = async (
  genre: string,
  page: number = 1,
  perPage: number = 20,
): Promise<AnilistMedia[]> => {
  try {
    const variables = {
      page,
      perPage,
      type: "ANIME",
      sort: ["POPULARITY_DESC"],
    };

    const response = await axios.post<AnilistRawResponse>(ANILIST_API_URL, {
      query: GET_ANIME_QUERY,
      variables,
    });

    const allMedia = response.data.data.Page.media;
    return allMedia.filter((media: AnilistMedia) =>
      media.genres.includes(genre),
    );
  } catch (error) {
    console.error(`خطأ في جلب الأنمي من تصنيف ${genre}:`, error);
    return [];
  }
};

// ✅ جلب مسلسلات الأنمي (TV فقط)
export const getAnimeSeries = async (
  page: number = 1,
  perPage: number = 20,
): Promise<{ media: AnilistMedia[]; totalPages: number }> => {
  try {
    const variables = {
      page,
      perPage,
      type: "ANIME",
      sort: ["POPULARITY_DESC"],
      format: "TV",
    };

    const response = await axios.post<AnilistRawResponse>(ANILIST_API_URL, {
      query: GET_ANIME_QUERY,
      variables,
    });

    return {
      media: response.data.data.Page.media,
      totalPages: response.data.data.Page.pageInfo.lastPage,
    };
  } catch (error) {
    console.error("خطأ في جلب مسلسلات الأنمي:", error);
    return { media: [], totalPages: 0 };
  }
};

// ✅ جلب أفلام الأنمي (MOVIE فقط)
export const getAnimeMovies = async (
  page: number = 1,
  perPage: number = 20,
): Promise<{ media: AnilistMedia[]; totalPages: number }> => {
  try {
    const variables = {
      page,
      perPage,
      type: "ANIME",
      sort: ["POPULARITY_DESC"],
      format: "MOVIE",
    };

    const response = await axios.post<AnilistRawResponse>(ANILIST_API_URL, {
      query: GET_ANIME_QUERY,
      variables,
    });

    return {
      media: response.data.data.Page.media,
      totalPages: response.data.data.Page.pageInfo.lastPage,
    };
  } catch (error) {
    console.error("خطأ في جلب أفلام الأنمي:", error);
    return { media: [], totalPages: 0 };
  }
};

// جلب تفاصيل أنمي معين
export const getAnimeDetails = async (
  id: number,
): Promise<AnilistMedia | null> => {
  const GET_DETAILS_QUERY = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        bannerImage
        description
        status
        episodes
        duration
        chapters
        volumes
        season
        seasonYear
        averageScore
        popularity
        format
        genres
        nextAiringEpisode {
          airingAt
          timeUntilAiring
          episode
        }
      }
    }
  `;

  try {
    const variables = { id };
    const response = await axios.post<AnilistDetailResponse>(ANILIST_API_URL, {
      query: GET_DETAILS_QUERY,
      variables,
    });

    return response.data.data.Media;
  } catch (error) {
    console.error(`خطأ في جلب تفاصيل الأنمي ${id}:`, error);
    return null;
  }
};
