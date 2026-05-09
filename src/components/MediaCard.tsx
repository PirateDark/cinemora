import { Link } from "react-router-dom";
import { Heart, Bookmark, ShieldAlert, Play, Star } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useWatchlist } from "../hooks/useWatchlist";
import { useFamilyMode } from "../hooks/useFamilyMode";

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  adult?: boolean;
}

interface MediaCardProps {
  media: MediaItem;
  type: "movie" | "tv";
}

export default function MediaCard({ media, type }: MediaCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isNotFamilyFriendly } = useFamilyMode();

  const id = media.id;
  const titleEn = media.title || media.name;
  const posterPath = media.poster_path;
  const overview = media.overview || "";
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  const score = media.vote_average;

  if (!id) return null;

  const notSafe = isNotFamilyFriendly(media);

  if (notSafe) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-gray-800/50 cursor-not-allowed border border-gray-700/30">
        <img
          src={posterUrl}
          alt={titleEn}
          className="w-full aspect-[2/3] object-cover blur-md scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-gray-950/70 flex flex-col items-center justify-center p-4 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
          <p className="text-white font-bold text-sm">غير مناسب للعائلة</p>
          <p className="text-gray-400 text-xs mt-1">فعّل الوضع العائلي للمشاهدة الآمنة</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gray-900/80 backdrop-blur-sm">
          <p className="font-bold text-xs text-gray-500 line-clamp-1 text-left" dir="ltr">{titleEn}</p>
        </div>
      </div>
    );
  }

  const linkTo = `/${type}/${id}`;

  const buildItem = () => ({
    id,
    mal_id: id,
    title: titleEn,
    name: titleEn,
    poster_path: posterPath || "",
    vote_average: score || 0,
    overview,
    release_date: media.release_date || media.first_air_date || "",
    genre_ids: media.genre_ids || [],
    type,
    score,
    images: {
      jpg: { image_url: posterUrl, large_image_url: posterUrl },
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(id)) removeFavorite(id);
    else addFavorite(buildItem());
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist(id)) removeFromWatchlist(id);
    else addToWatchlist(buildItem());
  };

  return (
    <Link to={linkTo} className="block group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden bg-gray-900 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-rose-500/20 border border-gray-800/50 hover:border-gray-700/50">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={posterUrl}
            alt={titleEn}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x450?text=No+Image";
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-3">
          {overview && (
            <p className="text-gray-200 text-xs line-clamp-3 mb-3 text-right leading-relaxed font-medium opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" dir="rtl">
              {overview}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-rose-600/30 active:scale-95">
            <Play className="w-3.5 h-3.5 fill-white" />
            مشاهدة
          </div>
        </div>

        <div className="absolute top-2 left-2 right-2 flex justify-between z-10">
          <button
            onClick={handleFavorite}
            className="p-2 bg-black/60 backdrop-blur-md rounded-lg hover:bg-rose-600 transition-all duration-300 hover:scale-110 active:scale-90"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite(id) ? "fill-rose-500 text-rose-500" : "text-white"}`} />
          </button>
          <button
            onClick={handleWatchlist}
            className="p-2 bg-black/60 backdrop-blur-md rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-110 active:scale-90"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isInWatchlist(id) ? "fill-blue-500 text-blue-500" : "text-white"}`} />
          </button>
        </div>

        {score != null && score > 0 && (
          <div className="absolute top-2 right-2 bg-rose-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-lg flex items-center gap-0.5 transition-opacity duration-300">
            <Star className="w-2.5 h-2.5 fill-white" /> {score?.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="font-bold text-sm line-clamp-1 text-left text-gray-100 group-hover:text-white transition-colors" dir="ltr">
          {titleEn}
        </h3>
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-yellow-400/80 text-xs flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400" /> {score?.toFixed(1) || "?"}
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            {type === "movie" ? "فيلم" : "مسلسل"}
          </span>
        </div>
      </div>
    </Link>
  );
}
