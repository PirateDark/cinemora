import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import MoviesPage from "./pages/MoviesPage";
import TvShowsPage from "./pages/TvShowsPage";
import MediaDetailPage from "./pages/MediaDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import WatchlistPage from "./pages/WatchlistPage";
import WatchHistoryPage from "./pages/WatchHistoryPage";
import SearchPage from "./pages/SearchPage";
import PrivacyPage from "./pages/PrivacyPage";
import ContactPage from "./pages/ContactPage";
import WatchPage from "./pages/WatchPage";
import SettingsPage from "./pages/SettingsPage";
import AsianPage from "./pages/AsianPage";
import AnimePage from "./pages/AnimePage";
import AnimeDetailPage from "./pages/AnimeDetailPage";
import TurkishShowsPage from "./pages/TurkishShowsPage";
import TurkishMoviesPage from "./pages/TurkishMoviesPage";
import BackToTop from "./components/BackToTop";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <main
        className="flex-grow container mx-auto px-4 py-6 animate-fadeIn"
        key={location.pathname}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TvShowsPage />} />
          <Route path="/search" element={<SearchPage key={location.key} />} />

          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/history" element={<WatchHistoryPage />} />

          <Route path="/movie/:id" element={<MediaDetailPage />} />
          <Route path="/tv/:id" element={<MediaDetailPage />} />
          <Route path="/watch/movie/:id" element={<WatchPage />} />
          <Route
            path="/watch/tv/:id/:season/:episode"
            element={<WatchPage />}
          />

          <Route path="/asian" element={<AsianPage />} />
          <Route path="/anime" element={<AnimePage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />

          <Route path="/tv/turkish" element={<TurkishShowsPage />} />
          <Route path="/movies/turkish" element={<TurkishMoviesPage />} />

          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
