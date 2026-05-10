import { useState } from "react";
import { Info, Star, Calendar } from "lucide-react";

interface MediaInfoProps {
  poster: string;
  title: string;
  year: string;
  rating: string;
  genres: string[];
  overview: string;
}

export default function MediaInfo({ poster, title, year, rating, genres, overview }: MediaInfoProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 p-4">
      <div className="flex gap-4">
        {poster && (
          <div className="relative shrink-0">
            <img
              src={poster}
              alt={title}
              className="w-20 h-28 object-cover rounded-xl shadow-lg ring-1 ring-gray-700/50"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white mb-1.5 line-clamp-2">{title}</h2>
          <div className="flex items-center gap-2.5 text-xs text-gray-400 mb-2.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {year}
            </span>
            {rating !== "0" && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {rating}
              </span>
            )}
          </div>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {genres.slice(0, 3).map((genre) => (
                <span key={genre} className="text-[10px] px-2 py-0.5 bg-gray-800 rounded-full text-gray-400 border border-gray-700/50">
                  {genre}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition"
          >
            <Info className="w-3 h-3" />
            {showDetails ? "إخفاء الوصف" : "عرض الوصف"}
          </button>
          {showDetails && (
            <p className="text-xs text-gray-400 leading-relaxed mt-2.5 pt-2.5 border-t border-gray-700/50">
              {overview}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
