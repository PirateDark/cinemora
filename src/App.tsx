import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MoviesPage from "./pages/MoviesPage";
import TvShowsPage from "./pages/TvShowsPage";
import MediaDetailPage from "./pages/MediaDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import WatchlistPage from "./pages/WatchlistPage";
import SearchPage from "./pages/SearchPage";
import PrivacyPage from "./pages/PrivacyPage";
import ContactPage from "./pages/ContactPage";
import WatchPage from "./pages/WatchPage";
import SettingsPage from "./pages/SettingsPage";
import AsianPage from "./pages/AsianPage";
import AnimePage from "./pages/AnimePage";
import TurkishShowsPage from "./pages/TurkishShowsPage";
import TurkishMoviesPage from "./pages/TurkishMoviesPage";

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          {/* الصفحات الرئيسية */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TvShowsPage />} />
          <Route path="/search" element={<SearchPage key={location.key} />} />

          {/* صفحات المفضلة والمشاهدة */}
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />

          {/* صفحات التفاصيل والمشاهدة */}
          <Route path="/movie/:id" element={<MediaDetailPage />} />
          <Route path="/tv/:id" element={<MediaDetailPage />} />
          <Route path="/watch/movie/:id" element={<WatchPage />} />
          <Route
            path="/watch/tv/:id/:season/:episode"
            element={<WatchPage />}
          />

          {/* صفحات المحتوى المتخصص */}
          {/* آسيوي (كوري، ياباني، صيني في صفحة واحدة) */}
          <Route path="/asian" element={<AsianPage />} />

          {/* أنمي (جميع أقسام الأنمي في صفحة واحدة) */}
          <Route path="/anime" element={<AnimePage />} />

          {/* مسلسلات وأفلام تركية */}
          <Route path="/tv/turkish" element={<TurkishShowsPage />} />
          <Route path="/movies/turkish" element={<TurkishMoviesPage />} />

          {/* صفحات عامة */}
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
