import { Link } from "react-router-dom";
import { Heart, Bookmark, ShieldAlert, Play } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { useWatchlist } from "../hooks/useWatchlist";
import { useFamilyMode } from "../hooks/useFamilyMode";

interface MediaCardProps {
  media: any;
  type: "movie" | "tv";
}

export default function MediaCard({ media, type }: MediaCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isNotFamilyFriendly } = useFamilyMode();

  const id = media.id;
  const titleEn = media.title_en || media.name_en || media.title || media.name;
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
      <div className="relative rounded-xl overflow-hidden bg-gray-800 opacity-90 cursor-not-allowed">
        <img
          src={posterUrl}
          alt={titleEn}
          className="w-full aspect-[2/3] object-cover blur-sm"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 text-center">
          <ShieldAlert className="w-12 h-12 text-amber-500 mb-2" />
          <p className="text-white font-bold text-sm">⚠️ غير مناسب للعائلة</p>
          <p className="text-gray-300 text-xs mt-1">
            فعّل الوضع العائلي للمشاهدة الآمنة
          </p>
        </div>
        <div className="p-3">
          <h3
            className="font-bold text-sm line-clamp-1 text-gray-400 text-left"
            dir="ltr"
          >
            {titleEn}
          </h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-yellow-400 text-sm">
              ★ {score?.toFixed(1) || "?"}
            </span>
            <span className="text-xs text-gray-400">
              {type === "movie" ? "فيلم" : "مسلسل"}
            </span>
          </div>
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
      <div className="relative rounded-xl overflow-hidden bg-gray-900 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-rose-500/20">
        <img
          src={posterUrl}
          alt={titleEn}
          className="w-full aspect-[2/3] object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />

        {/* طبقة Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4">
          {overview && (
            <p
              className="text-gray-200 text-xs line-clamp-4 mb-4 text-right leading-relaxed font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
              dir="rtl"
            >
              {overview}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg shadow-rose-600/40">
            <Play className="w-4 h-4 fill-white" />
            مشاهدة الآن
          </div>
        </div>

        {/* أزرار المفضلة وقائمة المشاهدة */}
        <div className="absolute top-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <button
            onClick={handleFavorite}
            className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl hover:bg-rose-600 transition-colors duration-300 z-10"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite(id) ? "fill-white text-white" : "text-white"}`}
            />
          </button>
          <button
            onClick={handleWatchlist}
            className="p-2.5 bg-black/60 backdrop-blur-md rounded-xl hover:bg-blue-600 transition-colors duration-300 z-10"
          >
            <Bookmark
              className={`w-4 h-4 ${isInWatchlist(id) ? "fill-white text-white" : "text-white"}`}
            />
          </button>
        </div>

        {/* التقييم */}
        {score > 0 && (
          <div className="absolute bottom-4 left-4 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg group-hover:opacity-0 transition-opacity duration-300">
             {score?.toFixed(1)} ★
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="font-bold text-sm line-clamp-1 text-left" dir="ltr">
          {titleEn}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-yellow-400 text-xs">
            ★ {score?.toFixed(1) || "?"}
          </span>
          <span className="text-xs text-gray-400">
            {type === "movie" ? "فيلم" : "مسلسل"}
          </span>
        </div>
      </div>
    </Link>
  );
}
