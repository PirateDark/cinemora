import { Link } from "react-router-dom";
import { Film, Tv, Heart, Bookmark, Clock, Mail, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* الشعار والوصف */}
          <div className="text-right">
            <h2 className="text-2xl font-extrabold bg-gradient-to-l from-rose-500 to-purple-600 bg-clip-text text-transparent mb-3">
              دراماكسيا
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              منصتك الأولى لمشاهدة الأفلام والمسلسلات العربية والأجنبية والتركية
              والآسيوية والأنمي — بجودة عالية وتجربة سلسة.
            </p>
          </div>

          {/* روابط سريعة */}
          <div className="text-right">
            <h3 className="text-white font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/movies"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  أفلام أجنبية <Film className="w-4 h-4" />
                </Link>
              </li>
              <li>
                <Link
                  to="/tv"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  مسلسلات <Tv className="w-4 h-4" />
                </Link>
              </li>
              <li>
                <Link
                  to="/anime"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  أنمي <span>🎌</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/asian"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  دراما آسيوية <span>🍜</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/movies/turkish"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  أفلام تركية <span>🎭</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* حسابي */}
          <div className="text-right">
            <h3 className="text-white font-bold mb-4">حسابي</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/favorites"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  المفضلة <Heart className="w-4 h-4" />
                </Link>
              </li>
              <li>
                <Link
                  to="/watchlist"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  قائمة المشاهدة <Bookmark className="w-4 h-4" />
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  سجل المشاهدة <Clock className="w-4 h-4" />
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  اتصل بنا <Mail className="w-4 h-4" />
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm justify-end"
                >
                  سياسة الخصوصية <Shield className="w-4 h-4" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* الحقوق */}
        <div className="border-t border-gray-800 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 دراماكسيا — جميع الحقوق محفوظة | منصة الدراما الأولى
          </p>
        </div>
      </div>
    </footer>
  );
}
