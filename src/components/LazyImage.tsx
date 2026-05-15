import { useState } from "react";
import { toWebp } from "../utils/images";

interface Props {
  src: string | null | undefined;
  alt: string | undefined;
  className?: string;
  aspectRatio?: string;
}

const FALLBACK = "https://via.placeholder.com/300x450?text=No+Image";

export default function LazyImage({ src, alt, className = "", aspectRatio }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);

  const imgSrc = fallback || !src ? FALLBACK : src;
  const webpSrc = !fallback && src ? toWebp(imgSrc) : imgSrc;

  return (
    <div className={`relative overflow-hidden ${className}`} style={aspectRatio ? { aspectRatio } : undefined}>
      {!loaded && (
        <div className="absolute inset-0 bg-gray-800/50 animate-pulse shimmer" />
      )}
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={imgSrc}
          alt={alt || ""}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!fallback) setFallback(true);
            else setLoaded(true);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </picture>
    </div>
  );
}
