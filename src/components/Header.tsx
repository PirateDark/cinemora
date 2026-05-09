import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Heart, Bookmark, Users, ShieldCheck, Search, Star, Film, Tv, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useFamilyMode } from "../hooks/useFamilyMode";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { searchMulti } from "../services/tmdbApi";
import NavDropdown from "./NavDropdown";
import MobileNavItem from "./MobileNavItem";
import SearchBar from "./SearchBar";

const dropdownItems = {
  tv: [
    { name: "🎬 مسلسلات أجنبية", path: "/tv" },
    { name: "🌍 مسلسلات عربية", path: "/tv/arabic" },
    { name: "🎭 مسلسلات تركية", path: "/tv/turkish" },
    { name: "🍜 مسلسلات آسيوية", path: "/asian" },
  ],
  movies: [
    { name: "🎬 أفلام أجنبية", path: "/movies" },
    { name: "🌍 أفلام عربية", path: "/movies/arabic" },
    { name: "🎭 أفلام تركية", path: "/movies/turkish" },
    { name: "🍜 أفلام آسيوية", path: "/movies/asian" },
  ],
  anime: [
    { name: "📺 مسلسلات أنمي", path: "/anime/series" },
    { name: "🎬 أفلام أنمي", path: "/anime/movies" },
  ],
};

const navLinks = [
  { name: "المفضلة", path: "/favorites", icon: Heart },
  { name: "قائمة المشاهدة", path: "/watchlist", icon: Bookmark },
];

export default function Header() {
  useKeyboardShortcuts({ "/": () => navigate("/search") });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchResults, setSearchResults] = useState<
    { id: number; title: string; poster_path?: string; media_type: string; vote_average?: number; date?: string }[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 400);
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, toggleEnabled } = useFamilyMode();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchMulti(debouncedQuery).then((data) => {
      const filtered = data
        .filter((item: { media_type?: string; poster_path?: string }) =>
          (item.media_type === "movie" || item.media_type === "tv") && item.poster_path
        )
        .slice(0, 5)
        .map((item: { id: number; title?: string; name?: string; poster_path?: string; media_type: string; vote_average?: number; release_date?: string; first_air_date?: string }) => ({
          id: item.id,
          title: item.title || item.name || "",
          poster_path: item.poster_path,
          media_type: item.media_type,
          vote_average: item.vote_average,
          date: item.release_date || item.first_air_date,
        }));
      setSearchResults(filtered);
      setShowResults(true);
    }).catch(() => {});
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const goToHome = () => {
    setSearchQuery("");
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/98 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-gray-900/90 backdrop-blur-md"
      } border-b border-gray-800/50`}
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={goToHome}
          className="text-2xl font-black bg-gradient-to-l from-rose-500 via-rose-400 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform tracking-tight"
        >
          سينمورا
        </button>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            onClick={goToHome}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              location.pathname === "/"
                ? "text-white bg-white/10"
                : "text-gray-300 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>

          <NavDropdown label="مسلسلات" items={dropdownItems.tv} />
          <NavDropdown label="أفلام" items={dropdownItems.movies} />
          <NavDropdown label="أنمي" items={dropdownItems.anime} />

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === link.path
                  ? "text-white bg-white/10"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 border ${
              settings.enabled
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30 shadow-lg shadow-emerald-600/10"
                : "bg-gray-800/50 text-gray-400 border-gray-700/50 hover:bg-gray-700/50 hover:text-gray-300"
            }`}
            title={settings.enabled ? "الوضع العائلي مفعل" : "تفعيل الوضع العائلي"}
          >
            {settings.enabled ? <ShieldCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span className="hidden lg:inline">وضع عائلي</span>
            {settings.enabled && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          </button>

          <div ref={searchRef} className="relative">
            <SearchBar
              value={searchQuery}
              onChange={(v) => {
                setSearchQuery(v);
                if (!v.trim()) setShowResults(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  setShowResults(false);
                  navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                }
              }}
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fadeIn">
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((result) => (
                    <Link
                      key={`${result.media_type}-${result.id}`}
                      to={`/${result.media_type}/${result.id}`}
                      onClick={() => { setShowResults(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800/80 transition-colors border-b border-gray-800/30 last:border-0 group"
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-800 shrink-0 ring-1 ring-gray-700/50 group-hover:ring-rose-500/30 transition-all">
                        {result.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${result.poster_path}`}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            {result.media_type === "movie" ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-rose-300 transition-colors">{result.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                            {result.media_type === "movie" ? "فيلم" : "مسلسل"}
                          </span>
                          {result.vote_average != null && result.vote_average > 0 && (
                            <span className="text-[10px] text-yellow-400 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-yellow-400" /> {result.vote_average.toFixed(1)}
                            </span>
                          )}
                          {result.date && (
                            <span className="text-[10px] text-gray-500">{new Date(result.date).getFullYear()}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                  onClick={() => { setShowResults(false); }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-medium transition-colors border-t border-gray-800/30"
                >
                  <Search className="w-3 h-3" />
                  عرض كل النتائج
                </Link>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/98 backdrop-blur-xl border-t border-gray-800/50 py-3 px-4 flex flex-col gap-1 animate-fadeIn max-h-[80vh] overflow-y-auto">
          <MobileNavItem to="/" icon={<Home className="w-4 h-4" />} label="الرئيسية" onClose={() => setIsMenuOpen(false)} onClick={goToHome} />

          <div className="pr-3 mt-2">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">مسلسلات</p>
            {dropdownItems.tv.map((item) => (
              <MobileNavItem key={item.path} to={item.path} label={item.name} onClose={() => setIsMenuOpen(false)} />
            ))}
          </div>

          <div className="pr-3 mt-2">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">أفلام</p>
            {dropdownItems.movies.map((item) => (
              <MobileNavItem key={item.path} to={item.path} label={item.name} onClose={() => setIsMenuOpen(false)} />
            ))}
          </div>

          <div className="pr-3 mt-2">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">أنمي</p>
            {dropdownItems.anime.map((item) => (
              <MobileNavItem key={item.path} to={item.path} label={item.name} onClose={() => setIsMenuOpen(false)} />
            ))}
          </div>

          {navLinks.map((link) => (
            <MobileNavItem key={link.path} to={link.path} icon={<link.icon className="w-4 h-4" />} label={link.name} onClose={() => setIsMenuOpen(false)} />
          ))}

          <button
            onClick={() => { toggleEnabled(); setIsMenuOpen(false); }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition w-full mt-1 ${
              settings.enabled
                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/30"
            }`}
          >
            {settings.enabled ? <ShieldCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            <span>{settings.enabled ? "الوضع العائلي: مفعل" : "الوضع العائلي"}</span>
          </button>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              const event = (window as any).__pwaInstallEvent;
              if (event) event.prompt();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition w-full mt-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30"
          >
            <Download className="w-4 h-4" />
            <span>حمّل التطبيق الآن</span>
          </button>

          <div className="mt-2">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      )}
    </header>
  );
}
