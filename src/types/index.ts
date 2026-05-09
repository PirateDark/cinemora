export interface MediaItem {
  id: number;
  mal_id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  type?: "movie" | "tv";
  score?: number;
  images?: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
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
