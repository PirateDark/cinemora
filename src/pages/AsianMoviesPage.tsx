import CategoryPage from "../components/CategoryPage";
import { getAsianMovies, TmdbMovie } from "../services/tmdbApi";

const COUNTRIES = [
  { code: "KR", label: "🇰🇷 كورية" },
  { code: "JP", label: "🇯🇵 يابانية" },
  { code: "CN", label: "🇨🇳 صينية" },
  { code: "TW", label: "🇹🇼 تايوانية" },
];

export default function AsianMoviesPage() {
  return (
    <CategoryPage<TmdbMovie>
      title="🎬 أفلام آسيوية"
      documentTitle="سينمورا | أفلام آسيوية"
      mediaType="movie"
      errorMessage="فشل تحميل الأفلام الآسيوية"
      fetchFn={(page, country) => getAsianMovies(country || "KR", page)}
      countries={COUNTRIES}
      useFilterLiveAction
    />
  );
}
