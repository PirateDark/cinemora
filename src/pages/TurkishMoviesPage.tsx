import CategoryPage from "../components/CategoryPage";
import { getTurkishMovies, TmdbMovie } from "../services/tmdbApi";

export default function TurkishMoviesPage() {
  return (
    <CategoryPage<TmdbMovie>
      title="🎬 أفلام تركية"
      documentTitle="سينمورا | أفلام تركية - أحدث الأفلام التركية المترجمة"
      mediaType="movie"
      errorMessage="فشل تحميل الأفلام التركية"
      fetchFn={(page) => getTurkishMovies(page)}
    />
  );
}
