import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";
import BackToTop from "./components/BackToTop";
import PwaInstallPrompt from "./components/PwaInstallPrompt";
import UpdatePrompt from "./components/UpdatePrompt";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import { HelmetProvider } from "react-helmet-async";
import { FamilyModeProvider } from "./components/FamilyModeProvider";

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
const AsianPage = lazy(() => import("./pages/AsianPage"));
const AnimeSeriesPage = lazy(() => import("./pages/AnimeSeriesPage"));
const AnimeMoviesPage = lazy(() => import("./pages/AnimeMoviesPage"));
const AnimeDetailPage = lazy(() => import("./pages/AnimeDetailPage"));
const TurkishShowsPage = lazy(() => import("./pages/TurkishShowsPage"));
const TurkishMoviesPage = lazy(() => import("./pages/TurkishMoviesPage"));
const ArabicMoviesPage = lazy(() => import("./pages/ArabicMoviesPage"));
const ArabicTvPage = lazy(() => import("./pages/ArabicTvPage"));
const AsianMoviesPage = lazy(() => import("./pages/AsianMoviesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <HelmetProvider>
      <ToastProvider>
      <FamilyModeProvider>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 animate-fadeIn">
        <ErrorBoundary>
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
            <Route path="/anime/series" element={<AnimeSeriesPage />} />
            <Route path="/anime/movies" element={<AnimeMoviesPage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />

            <Route path="/tv/turkish" element={<TurkishShowsPage />} />
            <Route path="/tv/arabic" element={<ArabicTvPage />} />
            <Route path="/movies/turkish" element={<TurkishMoviesPage />} />
            <Route path="/movies/arabic" element={<ArabicMoviesPage />} />
            <Route path="/movies/asian" element={<AsianMoviesPage />} />

            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <BackToTop />
      <PwaInstallPrompt />
      <UpdatePrompt />
      </FamilyModeProvider>
      </ToastProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
