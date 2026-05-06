// src/types/index.ts

export interface Anime {
  mal_id: number; // سيستخدم TMDB id
  title: string; // الاسم بالعربية من TMDB
  title_japanese?: string; // original_name من TMDB
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  score: number; // vote_average
  episodes?: number; // number_of_episodes
  duration?: string; // مشتق من number_of_seasons
  status?: string; // status من TMDB
  year?: number; // من first_air_date
  synopsis?: string; // overview
  genres?: Array<{ mal_id: number; name: string; type?: string }>; // type اختياري
  studios?: Array<{ name: string }>; // يمكن تركه فارغاً أو إضافته لاحقاً
  type?: string; // 'TV' أو غيره
}

export interface NewsItem {
  mal_id: number;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  url: string;
  image_url: string;
}

export interface Genre {
  mal_id: number;
  name: string;
  count: number;
}
