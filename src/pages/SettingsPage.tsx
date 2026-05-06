// src/pages/SettingsPage.tsx
import { useState, useEffect } from "react";
import {
  Trash2,
  RefreshCw,
  User,
  Eye,
  Save,
  Moon,
  Sun,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useFamilyMode } from "../hooks/useFamilyMode"; // تم إزالة FAMILY_UNSAFE_GENRES

export default function SettingsPage() {
  // إعدادات الحساب (محلية)
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // إعدادات العرض
  const [darkMode, setDarkMode] = useState(true);

  // الوضع العائلي
  const { settings, updateSettings, availableGenres } = useFamilyMode();

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedEmail = localStorage.getItem("email");
    if (savedUsername) setUsername(savedUsername);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const saveAccountSettings = () => {
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    alert("تم حفظ إعدادات الحساب بنجاح");
  };

  const clearFavorites = () => {
    if (window.confirm("هل أنت متأكد من حذف جميع الأنميات من المفضلة؟")) {
      localStorage.removeItem("favorites");
      alert("تم حذف المفضلة");
    }
  };

  const clearWatchlist = () => {
    if (
      window.confirm("هل أنت متأكد من حذف جميع الأنميات من قائمة المشاهدة؟")
    ) {
      localStorage.removeItem("watchlist");
      alert("تم حذف قائمة المشاهدة");
    }
  };

  const clearCache = () => {
    if (
      window.confirm(
        "هل أنت متأكد من مسح الكاش؟ سيتم إعادة تحميل البيانات من الخادم",
      )
    ) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("cache_")) {
          localStorage.removeItem(key);
        }
      });
      alert("تم مسح الكاش بنجاح");
    }
  };

  const resetAll = () => {
    if (
      window.confirm(
        "سيتم حذف جميع البيانات: المفضلة، قائمة المشاهدة، الكاش، وإعدادات الحساب. هل أنت متأكد؟",
      )
    ) {
      localStorage.clear();
      setUsername("");
      setEmail("");
      alert("تم إعادة تعيين جميع البيانات");
      window.location.reload();
    }
  };

  // دوال الوضع العائلي
  const toggleBlockAdult = () => {
    updateSettings({ ...settings, blockAdult: !settings.blockAdult });
  };

  const toggleGenre = (genreId: number) => {
    const newBlocked = settings.blockedGenres.includes(genreId)
      ? settings.blockedGenres.filter((id) => id !== genreId)
      : [...settings.blockedGenres, genreId];
    updateSettings({ ...settings, blockedGenres: newBlocked });
  };

  const toggleFamilyModeEnabled = () => {
    updateSettings({ ...settings, enabled: !settings.enabled });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>

      {/* ====== إعدادات الوضع العائلي ====== */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" /> الوضع العائلي
        </h2>

        <div className="space-y-4">
          {/* زر التفعيل الرئيسي */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تفعيل الوضع العائلي</p>
              <p className="text-sm text-gray-400">
                إخفاء المحتوى غير المناسب للعائلة
              </p>
            </div>
            <button
              onClick={toggleFamilyModeEnabled}
              className={`px-4 py-2 rounded-lg transition ${
                settings.enabled ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              {settings.enabled ? "مفعل ✅" : "غير مفعل"}
            </button>
          </div>

          {settings.enabled && (
            <>
              {/* منع المحتوى للكبار */}
              <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> منع المحتوى للكبار (+18)
                  </p>
                  <p className="text-sm text-gray-400">
                    الأفلام التي تحمل علامة (adult)
                  </p>
                </div>
                <button
                  onClick={toggleBlockAdult}
                  className={`px-4 py-2 rounded-lg transition ${
                    settings.blockAdult ? "bg-rose-600" : "bg-gray-700"
                  }`}
                >
                  {settings.blockAdult ? "ممنوع" : "مسموح"}
                </button>
              </div>

              {/* تصنيفات إضافية */}
              <div className="border-t border-gray-700 pt-4">
                <p className="font-medium mb-2">منع تصنيفات إضافية</p>
                <div className="flex flex-wrap gap-3">
                  {availableGenres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => toggleGenre(genre.id)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        settings.blockedGenres.includes(genre.id)
                          ? "bg-rose-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ملاحظة: هذه التصنيفات إضافية. عند تفعيلها، ستُخفى البطاقات
                  التي تحملها.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ====== إعدادات الحساب ====== */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> إعدادات الحساب
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              اسم المستخدم
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              className="w-full md:w-96"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              البريد الإلكتروني
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="w-full md:w-96"
            />
          </div>
          <Button
            onClick={saveAccountSettings}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> حفظ الإعدادات
          </Button>
        </div>
      </div>

      {/* ====== إعدادات العرض ====== */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" /> إعدادات العرض
        </h2>
        <div className="flex items-center justify-between">
          <span>الوضع الداكن</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            {darkMode ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          الموقع يعمل بالوضع الداكن بشكل افتراضي
        </p>
      </div>

      {/* ====== إدارة البيانات ====== */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5" /> إدارة البيانات
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={clearFavorites}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
          >
            <Trash2 className="w-4 h-4" /> حذف المفضلة
          </button>
          <button
            onClick={clearWatchlist}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
          >
            <Trash2 className="w-4 h-4" /> حذف قائمة المشاهدة
          </button>
          <button
            onClick={clearCache}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition"
          >
            <RefreshCw className="w-4 h-4" /> مسح الكاش
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600/20 text-rose-400 rounded-lg hover:bg-rose-600/30 transition"
          >
            <Trash2 className="w-4 h-4" /> إعادة تعيين الكل
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-4">
          ملاحظة: مسح الكاش سيؤدي إلى إعادة تحميل البيانات من الخادم في المرة
          القادمة.
        </p>
      </div>
    </div>
  );
}
