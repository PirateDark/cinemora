import CategoryPage from "../components/CategoryPage";
import { getArabicMovies, TmdbMovie } from "../services/tmdbApi";

export default function ArabicMoviesPage() {
  return (
    <CategoryPage<TmdbMovie>
      title="🌍 أفلام عربية"
      documentTitle="سينمورا | أفلام عربية - أحدث الأفلام العربية"
      mediaType="movie"
      errorMessage="فشل تحميل الأفلام العربية"
      fetchFn={(page) => getArabicMovies(page)}
    />
  );
}
