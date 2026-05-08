import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import BackToTop from "./components/BackToTop";

const HomePage = lazy(() => import("./pages/HomePage"));
const MoviesPage = lazy(() => import("./pages/MoviesPage"));
const TvShowsPage = lazy(() => import("./pages/TvShowsPage"));
const MediaDetailPage = lazy(() => import("./pages/MediaDetailPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));
const WatchHistoryPage = lazy(() => import("./pages/WatchHistoryPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const WatchPage = lazy(() => import("./pages/WatchPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AsianPage = lazy(() => import("./pages/AsianPage"));
const AnimePage = lazy(() => import("./pages/AnimePage"));
const AnimeDetailPage = lazy(() => import("./pages/AnimeDetailPage"));
const TurkishShowsPage = lazy(() => import("./pages/TurkishShowsPage"));
const TurkishMoviesPage = lazy(() => import("./pages/TurkishMoviesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 animate-fadeIn">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/tv" element={<TvShowsPage />} />
            <Route path="/search" element={<SearchPage />} />

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
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
