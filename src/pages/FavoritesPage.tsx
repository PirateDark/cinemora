// src/pages/FavoritesPage.tsx
import { useFavorites } from "../hooks/useFavorites";
import MediaCard from "../components/MediaCard";
import EmptyState from "../components/EmptyState";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="لا توجد مفضلات"
        message="أضف أفلامك أو مسلسلاتك المفضلة بالنقر على القلب"
        icon={<Heart className="w-16 h-16 text-gray-600" />}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">المفضلة</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {favorites.map((item) => (
          <MediaCard
            key={item.mal_id}
            media={item}
            type={item.type === "tv" ? "tv" : "movie"}
          />
        ))}
      </div>
    </div>
  );
}
