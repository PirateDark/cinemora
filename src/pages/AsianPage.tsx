import CategoryPage from "../components/CategoryPage";
import { getAsianShows, TmdbTvShow } from "../services/tmdbApi";

const COUNTRIES = [
  { code: "KR", label: "🇰🇷 كورية" },
  { code: "JP", label: "🇯🇵 يابانية" },
  { code: "CN", label: "🇨🇳 صينية" },
  { code: "TW", label: "🇹🇼 تايوانية" },
];

export default function AsianPage() {
  return (
    <CategoryPage<TmdbTvShow>
      title="🌏 دراما آسيوية"
      documentTitle="سينمورا | دراما آسيوية - كورية، يابانية، صينية"
      mediaType="tv"
      errorMessage="فشل تحميل المسلسلات الآسيوية"
      fetchFn={(page, country) => getAsianShows(country || "KR", page)}
      countries={COUNTRIES}
      useFilterLiveAction
    />
  );
}
