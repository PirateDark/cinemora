import CategoryPage from "../components/CategoryPage";
import { getTurkishShows, TmdbTvShow } from "../services/tmdbApi";

export default function TurkishShowsPage() {
  return (
    <CategoryPage<TmdbTvShow>
      title="🎭 مسلسلات تركية"
      documentTitle="سينمورا | مسلسلات تركية - أفضل المسلسلات التركية المترجمة"
      mediaType="tv"
      errorMessage="فشل تحميل المسلسلات التركية"
      fetchFn={(page) => getTurkishShows(page)}
    />
  );
}
