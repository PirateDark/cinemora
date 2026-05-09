import CategoryPage from "../components/CategoryPage";
import { getArabicTvShows, TmdbTvShow } from "../services/tmdbApi";

export default function ArabicTvPage() {
  return (
    <CategoryPage<TmdbTvShow>
      title="🌍 مسلسلات عربية"
      documentTitle="سينمورا | مسلسلات عربية - أفضل المسلسلات العربية"
      mediaType="tv"
      errorMessage="فشل تحميل المسلسلات العربية"
      fetchFn={(page) => getArabicTvShows(page)}
    />
  );
}
