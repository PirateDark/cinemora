import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { AnilistMedia } from "../types/anilist";

interface Props {
  anime: AnilistMedia;
  type: "movie" | "series";
}

export default function AnimeCard({ anime, type }: Props) {
  const title = anime.title.english || anime.title.romaji || anime.title.native || "بدون عنوان";
  const imageUrl = anime.coverImage?.large || anime.coverImage?.medium || "";
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "?";

  return (
    <Link to={`/anime/${anime.id}`} className="block group cursor-pointer">
      <div className="relative rounded-xl overflow-hidden bg-gray-900 hover:scale-[1.03] transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 border border-gray-800/50">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x450?text=No+Image";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-xs font-bold bg-rose-600 px-2 py-1 rounded">
            {type === "movie" ? "فيلم" : "مسلسل"}
          </span>
        </div>
        <div className="p-3 min-h-[80px] flex flex-col justify-between">
          <h3 className="font-bold text-sm leading-snug line-clamp-2 text-left text-gray-100" dir="ltr">{title}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-yellow-400 text-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400" /> {score}
            </span>
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
              {type === "movie"
                ? (anime.duration ? `${anime.duration} دقيقة` : anime.format)
                : `${anime.episodes || "?"} حلقة`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
