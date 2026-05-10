import React from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Globe, Shield, Zap, Heart, Clock, History } from "lucide-react";

interface FooterLink {
  name: string;
  path: string;
  icon?: string;
}

const groups: { label: string; links: FooterLink[] }[] = [
  {
    label: "المحتوى",
    links: [
      { name: "أفلام عالمية", path: "/movies" },
      { name: "مسلسلات عالمية", path: "/tv" },
      { name: "مسلسلات أنمي", path: "/anime/series" },
      { name: "أفلام أنمي", path: "/anime/movies" },
    ],
  },
  {
    label: "المناطق",
    links: [
      { name: "أفلام عربية", path: "/movies/arabic" },
      { name: "مسلسلات عربية", path: "/tv/arabic" },
      { name: "مسلسلات تركية", path: "/tv/turkish" },
      { name: "أفلام تركية", path: "/movies/turkish" },
      { name: "دراما آسيوية", path: "/asian" },
      { name: "أفلام آسيوية", path: "/movies/asian" },
    ],
  },
  {
    label: "المستخدم",
    links: [
      { name: "مكتبتي الخاصة", path: "/favorites", icon: "Heart" },
      { name: "المشاهدة لاحقاً", path: "/watchlist", icon: "Clock" },
      { name: "آخر ما شاهدته", path: "/history", icon: "History" },
    ],
  },
  {
    label: "معلومات",
    links: [
      { name: "تواصل معنا", path: "/contact" },
      { name: "سياسة الخصوصية", path: "/privacy" },
    ],
  },
];

const iconMap: Record<string, React.ElementType> = {
  Heart,
  Clock,
  History,
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export default function Footer() {
  return (
    <footer className="relative bg-gray-950/80 backdrop-blur-xl border-t border-gray-800/40 mt-20 overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 pt-12 pb-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-white font-bold text-xs mb-4 tracking-wider uppercase opacity-70">
                {group.label}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => {
                  const Icon = link.icon ? iconMap[link.icon] : null;
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="flex items-center gap-2 text-gray-400 hover:text-[#ff0055] transition-all duration-300 hover:translate-x-2 text-sm"
                      >
                        {Icon && <Icon className="w-4 h-4 shrink-0" />}
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[#ff0055] font-bold text-lg">تطبيق سينمورا</span>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`}
                alt="QRcode"
                className="w-28 h-28"
                loading="lazy"
              />
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                حمّل التطبيق الآن وتمتع بالتجربة الكاملة
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#ff0055]/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xl font-black bg-gradient-to-l from-[#ff0055] via-rose-400 to-[#ff0055] bg-clip-text text-transparent tracking-tight"
              style={{ filter: "drop-shadow(0 0 8px rgba(255, 0, 85, 0.5))" }}
            >
              سينمورا
            </Link>
            <span className="w-px h-5 bg-[#ff0055]/20 hidden md:block" />
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} — جميع الحقوق محفوظة
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-gray-600 text-[10px] tracking-widest font-bold px-2.5 py-1 rounded-full bg-gray-800/30 border border-gray-700/30">
              <Zap className="w-2.5 h-2.5 text-yellow-500/70" /> 4K
            </span>
            <span className="flex items-center gap-1 text-gray-600 text-[10px] tracking-widest font-bold px-2.5 py-1 rounded-full bg-gray-800/30 border border-gray-700/30">
              <Globe className="w-2.5 h-2.5 text-blue-500/70" /> HD
            </span>
            <span className="flex items-center gap-1 text-gray-600 text-[10px] tracking-widest font-bold px-2.5 py-1 rounded-full bg-gray-800/30 border border-gray-700/30">
              <Shield className="w-2.5 h-2.5 text-emerald-500/70" /> آمن
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-rose-400 transition-colors duration-200"
          >
            عد إلى الأعلى
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
