// src/components/MediaCard.tsx
import { Link } from "react-router-dom";
import { Heart, Bookmark, ShieldAlert } from "lucide-react";
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
  const title = media.title || media.name;
  const posterPath = media.poster_path;
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "https://via.placeholder.com/300x450?text=No+Image";
  const score = media.vote_average;

  if (!id) return null;

  // فحص إذا كان المحتوى غير مناسب حسب إعدادات المستخدم
  const notSafe = isNotFamilyFriendly(media);

  // إذا كان المحتوى غير مناسب للعائلة، نعرض بطاقة محظورة
  if (notSafe) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-gray-800 opacity-90 cursor-not-allowed">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-64 object-cover blur-sm"
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
          <h3 className="font-bold text-sm line-clamp-1 text-gray-400">
            {title}
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(id)) removeFavorite(id);
    else
      addFavorite({
        mal_id: id,
        title: title,
        images: {
          jpg: {
            image_url: posterUrl,
            large_image_url: posterUrl,
          },
        },
        score: score,
      });
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist(id)) removeFromWatchlist(id);
    else
      addToWatchlist({
        mal_id: id,
        title: title,
        images: {
          jpg: {
            image_url: posterUrl,
            large_image_url: posterUrl,
          },
        },
        score: score,
      });
  };

  return (
    <Link to={linkTo} className="block group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden bg-gray-900 hover:scale-105 transition-transform duration-300">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-64 object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <button
            onClick={handleFavorite}
            className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition z-10"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite(id) ? "fill-rose-500 text-rose-500" : "text-white"
              }`}
            />
          </button>
          <button
            onClick={handleWatchlist}
            className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition z-10"
          >
            <Bookmark
              className={`w-5 h-5 ${
                isInWatchlist(id) ? "fill-blue-500 text-blue-500" : "text-white"
              }`}
            />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-bold text-sm line-clamp-1">{title}</h3>
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
    </Link>
  );
}
