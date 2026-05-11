import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Heart, Bookmark, Users, ShieldCheck, Shield, Download, LogIn, LogOut, User, ChevronDown, Crown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useFamilyMode } from "../hooks/useFamilyMode";
import NavDropdown from "./NavDropdown";
import MobileNavItem from "./MobileNavItem";
import { useAuth } from "../contexts/AuthContext";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, toggleEnabled } = useFamilyMode();
  const { user, logout } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).__pwaInstallEvent) {
      setCanInstall(true);
    }
    const handler = () => setCanInstall(!!(window as any).__pwaInstallEvent);
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const goToHome = () => {
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-950/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-gray-800/40"
          : "bg-gray-950/60 backdrop-blur-md border-b border-gray-800/20"
      }`}
    >
      <div className="flex justify-between items-center w-full px-8 py-2.5">
        {/* Right - Logo + Navigation */}
        <div className="hidden md:flex items-center gap-6 ml-8">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={goToHome}
              className="text-2xl font-black bg-gradient-to-l from-rose-500 via-rose-400 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform tracking-tight"
            >
              سينمورا
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
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
        </div>

        {/* Left - User Actions: Login, FamilyMode, Search (left to right) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Login / User Menu */}
          {token ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 group"
              >
                <div className="w-[35px] h-[35px] rounded-full overflow-hidden border-2 border-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.5)] transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(255,0,85,0.7)]">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {showUserMenu && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/98 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-800/50">
                    <p className="text-white text-sm font-medium truncate">{user?.name || "المستخدم"}</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email || ""}</p>
                  </div>
                  <div className="py-1">
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-rose-400" />
                        لوحة التحكم
                      </Link>
                    )}
                    <Link
                      to="/watchlist"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-amber-400" />
                      قائمة المشاهدة
                    </Link>
                    <Link
                      to="/favorites"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/80 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-red-400" />
                      المفضلة
                    </Link>
                  </div>
                  <div className="border-t border-gray-800/50 py-1">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); navigate("/"); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/10 transition-colors w-full text-right"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 h-10 bg-transparent border-2 border-[#ff0055] text-[#ff0055] text-sm font-bold rounded-full transition-all duration-300 hover:bg-[#ff0055] hover:text-white hover:shadow-[0_0_15px_#ff0055] active:scale-95"
            >
              <Crown size={14} />
              <span>تسجيل الدخول</span>
            </Link>
          )}

          {/* Family Mode */}
          <button
            onClick={toggleEnabled}
            className={`flex items-center gap-1.5 px-4 py-2 h-10 rounded-full text-sm font-bold transition-all duration-300 border ${
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
        </div>

        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={toggleEnabled}
            className={`p-2 rounded-lg transition-all ${
              settings.enabled
                ? "text-emerald-400 bg-emerald-600/20"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
            title={settings.enabled ? "الوضع العائلي مفعل" : "تفعيل الوضع العائلي"}
          >
            {settings.enabled ? <ShieldCheck className="w-5 h-5" /> : <Users className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 hover:bg-white/10 rounded-lg transition"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/98 backdrop-blur-xl border-t border-gray-800/50 py-4 px-4 flex flex-col gap-1 animate-slideDown max-h-[85vh] overflow-y-auto">
          <div className="border-b border-gray-800/30 pb-2 mb-1">
            <MobileNavItem to="/" icon={<Home className="w-4 h-4" />} label="الرئيسية" onClose={() => setIsMenuOpen(false)} onClick={goToHome} />
          </div>

          <div className="space-y-0.5">
            <p className="text-gray-500 text-[10px] font-bold tracking-wider px-4 pb-1 pt-2">مسلسلات</p>
            {dropdownItems.tv.map((item) => (
              <MobileNavItem key={item.path} to={item.path} label={item.name} onClose={() => setIsMenuOpen(false)} />
            ))}
          </div>

          <div className="space-y-0.5">
            <p className="text-gray-500 text-[10px] font-bold tracking-wider px-4 pb-1 pt-3">أفلام</p>
            {dropdownItems.movies.map((item) => (
              <MobileNavItem key={item.path} to={item.path} label={item.name} onClose={() => setIsMenuOpen(false)} />
            ))}
          </div>

          <div className="space-y-0.5">
            <p className="text-gray-500 text-[10px] font-bold tracking-wider px-4 pb-1 pt-3">أنمي</p>
            {dropdownItems.anime.map((item) => (
              <MobileNavItem key={item.path} to={item.path} label={item.name} onClose={() => setIsMenuOpen(false)} />
            ))}
          </div>

          <div className="border-t border-gray-800/30 pt-2 mt-2 space-y-0.5">
            {navLinks.map((link) => (
              <MobileNavItem key={link.path} to={link.path} icon={<link.icon className="w-4 h-4" />} label={link.name} onClose={() => setIsMenuOpen(false)} />
            ))}
          </div>

          <div className="border-t border-gray-800/30 pt-3 mt-2 space-y-2">
            <button
              onClick={() => { toggleEnabled(); setIsMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition w-full ${
                settings.enabled
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20"
                  : "bg-gray-800/50 text-gray-300 active:bg-gray-700/50 border border-gray-700/30"
              }`}
            >
              {settings.enabled ? <ShieldCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              <span>{settings.enabled ? "الوضع العائلي: مفعل" : "الوضع العائلي"}</span>
            </button>

            {token ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700/30">
                  <div className="w-[38px] h-[38px] rounded-full overflow-hidden ring-2 ring-gray-700 shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{user?.name || "المستخدم"}</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email || ""}</p>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <MobileNavItem to="/admin" icon={<Shield className="w-4 h-4 text-rose-400" />} label="لوحة التحكم" onClose={() => setIsMenuOpen(false)} />
                )}
                <MobileNavItem to="/watchlist" icon={<Bookmark className="w-4 h-4 text-amber-400" />} label="قائمة المشاهدة" onClose={() => setIsMenuOpen(false)} />
                <MobileNavItem to="/favorites" icon={<Heart className="w-4 h-4 text-red-400" />} label="المفضلة" onClose={() => setIsMenuOpen(false)} />
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); navigate("/"); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition w-full text-red-400 hover:bg-red-600/10 border border-gray-700/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-transparent border-2 border-[#ff0055] text-[#ff0055] font-bold rounded-full transition-all duration-300 hover:bg-[#ff0055] hover:text-white hover:shadow-[0_0_15px_#ff0055] active:scale-95 w-full"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>
            )}

            {canInstall && (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  const event = (window as any).__pwaInstallEvent;
                  if (event) event.prompt();
                }}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition w-full bg-rose-600 text-white active:bg-rose-700 active:scale-[0.98] shadow-lg shadow-rose-600/30"
              >
                <Download className="w-4 h-4" />
                <span>حمّل تطبيق سينمورا</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
