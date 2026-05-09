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
    <div className="bg-gray-800/50 rounded-2xl p-5">
      <div className="flex gap-4">
        {poster && (
          <img
            src={poster}
            alt={title}
            className="w-24 h-32 object-cover rounded-lg shadow-lg"
          />
        )}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {year}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" /> {rating}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {genres.slice(0, 3).map((genre) => (
              <span key={genre} className="text-xs px-2 py-1 bg-gray-700 rounded-full">
                {genre}
              </span>
            ))}
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"
          >
            <Info className="w-3 h-3" />{" "}
            {showDetails ? "إخفاء الوصف" : "عرض الوصف"}
          </button>
          {showDetails && (
            <p className="text-sm text-gray-400 leading-relaxed mt-3 pt-3 border-t border-gray-700">
              {overview}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
