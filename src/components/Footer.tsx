import { Link } from "react-router-dom";
import { Film, Tv, Heart, Bookmark, Clock, Mail, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* الشعار والوصف */}
          <div className="text-right">
            <h2 className="text-3xl font-black bg-gradient-to-l from-rose-500 to-rose-700 bg-clip-text text-transparent mb-5 tracking-tight">
              دراماكسيا
            </h2>
            <p className="text-gray-400 text-sm leading-7 max-w-sm ml-auto">
              عالمك المتكامل لمشاهدة أحدث الأفلام والمسلسلات بجودة فائقة. نجمع لك أفضل المحتوى العربي والعالمي، والتركي، والآسيوي، والأنمي في مكان واحد مع تجربة مستخدم استثنائية.
            </p>
          </div>

          {/* روابط سريعة */}
          <div className="text-right">
            <h3 className="text-white font-black mb-6 text-lg">اكتشف المحتوى</h3>
            <ul className="space-y-3">
              {[
                { name: "أفلام عالمية", path: "/movies", icon: Film },
                { name: "مسلسلات عالمية", path: "/tv", icon: Tv },
                { name: "عالم الأنمي", path: "/anime", icon: null, emoji: "🎌" },
                { name: "دراما آسيوية", path: "/asian", icon: null, emoji: "🍜" },
                { name: "أفلام تركية", path: "/movies/turkish", icon: null, emoji: "🎭" },
                { name: "مسلسلات تركية", path: "/tv/turkish", icon: null, emoji: "🎬" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2.5 text-gray-400 hover:text-rose-500 transition-colors duration-300 text-sm justify-end font-medium group"
                  >
                    <span className="group-hover:translate-x-[-4px] transition-transform">{link.name}</span>
                    {link.icon ? <link.icon className="w-4 h-4 opacity-70" /> : <span className="text-xs">{link.emoji}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* حسابي والدعم */}
          <div className="text-right">
            <h3 className="text-white font-black mb-6 text-lg">روابط تهمك</h3>
            <ul className="space-y-3">
              {[
                { name: "المفضلة", path: "/favorites", icon: Heart },
                { name: "قائمة المشاهدة", path: "/watchlist", icon: Bookmark },
                { name: "سجل المشاهدة", path: "/history", icon: Clock },
                { name: "تواصل معنا", path: "/contact", icon: Mail },
                { name: "سياسة الخصوصية", path: "/privacy", icon: Shield },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2.5 text-gray-400 hover:text-rose-500 transition-colors duration-300 text-sm justify-end font-medium group"
                  >
                    <span className="group-hover:translate-x-[-4px] transition-transform">{link.name}</span>
                    <link.icon className="w-4 h-4 opacity-70" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* الحقوق */}
        <div className="border-t border-gray-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs font-medium">
            © 2026 دراماكسيا — جميع الحقوق محفوظة. صُمم بكل حب لعشاق السينما.
          </p>
          <div className="flex gap-6">
            <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">4K QUALITY</span>
            <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">FAST STREAMING</span>
            <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">SECURE PLATFORM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
