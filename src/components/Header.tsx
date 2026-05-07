import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  Home,
  Film,
  Tv,
  Heart,
  Bookmark,
  Users,
  Settings,
  Tv2,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useFamilyMode } from "../hooks/useFamilyMode";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);
  const navigate = useNavigate();
  const { settings, toggleEnabled: originalToggleEnabled } = useFamilyMode();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const tvRef = useRef<HTMLDivElement>(null);
  const moviesRef = useRef<HTMLDivElement>(null);
  const animeRef = useRef<HTMLDivElement>(null);

  const toggleEnabled = () => {
    originalToggleEnabled();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  useEffect(() => {
    if (debouncedQuery) {
      navigate(`/search?q=${encodeURIComponent(debouncedQuery)}`);
    }
  }, [debouncedQuery, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        tvRef.current &&
        !tvRef.current.contains(target) &&
        moviesRef.current &&
        !moviesRef.current.contains(target) &&
        animeRef.current &&
        !animeRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToHome = () => {
    setSearchQuery("");
    navigate("/");
  };

  const tvDropdownItems = [
    { name: "🎬 مسلسلات أجنبية", path: "/tv" },
    { name: "🎭 مسلسلات تركية", path: "/tv/turkish" },
    { name: "🍜 مسلسلات آسيوية", path: "/asian" },
  ];

  const moviesDropdownItems = [
    { name: "🎬 أفلام أجنبية", path: "/movies" },
    { name: "🎭 أفلام تركية", path: "/movies/turkish" },
    { name: "🍜 أفلام آسيوية", path: "/asian" },
  ];

  const animeDropdownItems = [{ name: "🎬 أنمي", path: "/anime" }];

  const navLinks = [
    { name: "المفضلة", path: "/favorites", icon: Heart },
    { name: "قائمة المشاهدة", path: "/watchlist", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={goToHome}
          className="text-2xl font-bold bg-gradient-to-l from-rose-500 to-purple-600 bg-clip-text text-transparent cursor-pointer"
        >
          دراماكسيا
        </button>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            onClick={goToHome}
            className="text-gray-300 hover:text-white transition flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>

          {/* قائمة مسلسلات */}
          <div className="relative" ref={tvRef}>
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "tv" ? null : "tv")
              }
              className="text-gray-300 hover:text-white transition flex items-center gap-1"
            >
              <Tv className="w-4 h-4" />
              <span>مسلسلات</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === "tv" && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                {tvDropdownItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpenDropdown(null)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* قائمة أفلام */}
          <div className="relative" ref={moviesRef}>
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "movies" ? null : "movies")
              }
              className="text-gray-300 hover:text-white transition flex items-center gap-1"
            >
              <Film className="w-4 h-4" />
              <span>أفلام</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === "movies" && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                {moviesDropdownItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpenDropdown(null)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* قائمة أنمي */}
          <div className="relative" ref={animeRef}>
            <button
              onClick={() =>
                setOpenDropdown(openDropdown === "anime" ? null : "anime")
              }
              className="text-gray-300 hover:text-white transition flex items-center gap-1"
            >
              <Tv2 className="w-4 h-4" />
              <span>أنمي</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === "anime" && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                {animeDropdownItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpenDropdown(null)}
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-gray-300 hover:text-white transition flex items-center gap-1"
            >
              <link.icon className="w-4 h-4" />
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition ${
              settings.enabled
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm hidden lg:inline">
              {settings.enabled ? "وضع عائلي ✅" : "وضع عائلي"}
            </span>
          </button>

          <Link
            to="/settings"
            className="flex items-center gap-2 px-3 py-1 rounded-full transition bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm hidden lg:inline">الإعدادات</span>
          </Link>

          <div className="flex items-center bg-gray-800 rounded-full px-3 py-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن فيلم أو مسلسل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none px-2 py-1 text-sm w-40 text-white placeholder-gray-400"
            />
          </div>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* القائمة المتنقلة */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 py-4 px-4 flex flex-col gap-3">
          <Link
            to="/"
            onClick={() => {
              setIsMenuOpen(false);
              goToHome();
            }}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>

          <div className="pr-4">
            <p className="text-gray-400 text-sm mb-2">مسلسلات</p>
            <div className="pr-4 space-y-2">
              {tvDropdownItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1 text-gray-300 hover:text-white text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pr-4">
            <p className="text-gray-400 text-sm mb-2">أفلام</p>
            <div className="pr-4 space-y-2">
              {moviesDropdownItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1 text-gray-300 hover:text-white text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pr-4">
            <p className="text-gray-400 text-sm mb-2">أنمي</p>
            <div className="pr-4 space-y-2">
              {animeDropdownItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-1 text-gray-300 hover:text-white text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <link.icon className="w-4 h-4" />
              <span>{link.name}</span>
            </Link>
          ))}

          <button
            onClick={() => {
              toggleEnabled();
              setIsMenuOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition w-full ${
              settings.enabled
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {settings.enabled ? "الوضع العائلي: مفعل ✅" : "الوضع العائلي"}
            </span>
          </button>

          <Link
            to="/settings"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            <Settings className="w-4 h-4" />
            <span>الإعدادات</span>
          </Link>

          <div className="flex items-center bg-gray-800 rounded-full px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none px-2 py-1 text-sm w-full text-white placeholder-gray-400"
            />
          </div>
        </div>
      )}
    </header>
  );
}
