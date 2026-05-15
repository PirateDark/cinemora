import { useState } from "react";
import { Star } from "lucide-react";

interface Props {
  initialScore: number | null;
  onRate: (score: number) => void;
  onRemove: () => void;
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" };

export default function RatingSystem({ initialScore, onRate, onRemove, size = "md" }: Props) {
  const [hovered, setHovered] = useState(0);
  const [score, setScore] = useState(initialScore);

  const handleClick = (star: number) => {
    if (score === star) {
      setScore(null);
      onRemove();
    } else {
      setScore(star);
      onRate(star);
    }
  };

  const starClass = SIZES[size];

  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || score || 0) >= star;
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-all hover:scale-110 active:scale-90 p-0.5"
            aria-label={`${star} نجوم`}
          >
            <Star
              className={`${starClass} transition-colors duration-150 ${
                filled ? "fill-yellow-400 text-yellow-400" : "text-gray-600 hover:text-gray-400"
              }`}
            />
          </button>
        );
      })}
      {score && (
        <span className="text-yellow-400 text-xs font-bold mr-1.5">{score}/5</span>
      )}
    </div>
  );
}
