import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { searchMulti, TmdbMovie, TmdbTvShow, getMovieDetails, getTvShowDetails } from "../services/tmdbApi";
import SEO from "../components/SEO";
import {
  LayoutDashboard, Film, Tv, Link2, Settings, LogOut, Search, Plus, X, Trash2, Eye, Loader2,
  AlertCircle, CheckCircle, Star, Calendar, Server, Globe,
} from "lucide-react";

type Section = "dashboard" | "movies" | "series" | "links" | "settings";

interface AdminMovie {
  id: string;
  tmdbId: number;
  title: string;
  year: string;
  poster: string;
  createdAt: string;
}

interface AdminSeries {
  id: string;
  tmdbId: number;
  title: string;
  year: string;
  poster: string;
  seasons: number;
  episodes: number;
  createdAt: string;
}

interface StreamLink {
  id: string;
  mediaId: string;
  mediaTitle: string;
  mediaType: "movie" | "series";
  serverName: string;
  url: string;
  quality: string;
  language: string;
  createdAt: string;
}

interface AdminSettings {
  siteName: string;
}

const LS_KEYS = {
  movies: "admin_movies",
  series: "admin_series",
  links: "stream_links",
  settings: "admin_settings",
};

function uuid() { return Math.random().toString(36).substring(2, 11); }

function loadFromLS<T>(key: string, fallback: T): T {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
}

function saveToLS(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

const sections: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { key: "movies", label: "الأفلام", icon: Film },
  { key: "series", label: "المسلسلات", icon: Tv },
  { key: "links", label: "روابط البث", icon: Link2 },
  { key: "settings", label: "الإعدادات", icon: Settings },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex" dir="rtl">
      <SEO title="لوحة التحكم - سينمورا" />

      {toast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold animate-fadeIn ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-64 bg-[#1a1a1a] border-l border-gray-800 z-40 transform transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-xl font-black tracking-tight">
            <span className="bg-gradient-to-l from-red-600 to-red-400 bg-clip-text text-transparent">Cinemora</span>
            <span className="text-gray-400 text-sm mr-2">Admin</span>
          </h1>
        </div>
        <nav className="p-3 space-y-1">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => { setSection(s.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                section === s.key
                  ? "bg-red-600/20 text-red-400 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <s.icon className="w-5 h-5" />
              {s.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-600/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#1a1a1a] border-b border-gray-800 flex items-center px-4 z-20 md:hidden">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="mr-3 text-lg font-bold">
          <span className="text-red-500">Cinemora</span> <span className="text-gray-400 text-sm">Admin</span>
        </h1>
      </div>

      {/* Main content */}
      <main className="flex-1 md:mr-64 mt-14 md:mt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto animate-fadeIn">
          {section === "dashboard" && <DashboardSection />}
          {section === "movies" && <MoviesSection showToast={showToast} />}
          {section === "series" && <SeriesSection showToast={showToast} />}
          {section === "links" && <LinksSection showToast={showToast} />}
          {section === "settings" && <SettingsSection showToast={showToast} />}
        </div>
      </main>
    </div>
  );
}

/* ─── Dashboard Home ─── */
function DashboardSection() {
  const movies = loadFromLS<AdminMovie[]>(LS_KEYS.movies, []);
  const series = loadFromLS<AdminSeries[]>(LS_KEYS.series, []);
  const links = loadFromLS<StreamLink[]>(LS_KEYS.links, []);

  const stats = [
    { label: "إجمالي الأفلام", value: movies.length, icon: Film, color: "from-blue-600 to-blue-800" },
    { label: "إجمالي المسلسلات", value: series.length, icon: Tv, color: "from-purple-600 to-purple-800" },
    { label: "روابط البث", value: links.length, icon: Link2, color: "from-green-600 to-green-800" },
    { label: "آخر تحديث", value: new Date().toLocaleDateString("ar-EG"), icon: Calendar, color: "from-amber-600 to-amber-800" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">لوحة التحكم</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-gray-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
        <h3 className="text-lg font-bold mb-4">المحتوى المضاف</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-300">الأفلام</span>
            <span className="text-red-400 font-bold">{movies.length}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-800">
            <span className="text-gray-300">المسلسلات</span>
            <span className="text-purple-400 font-bold">{series.length}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-300">روابط البث</span>
            <span className="text-green-400 font-bold">{links.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TMDB Search Modal ─── */
interface TmdbSearchModalProps {
  type: "movie" | "tv";
  onSelect: () => void;
  onClose: () => void;
}

function TmdbSearchModal({ type, onSelect, onClose }: TmdbSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(TmdbMovie | TmdbTvShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [adding, setAdding] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchMulti(query);
      const filtered = data.filter(
        (item: any) => item.media_type === type && item.poster_path
      );
      setResults(filtered);
      setSelectedId(null);
      setDetails(null);
    } catch { setResults([]); }
    setLoading(false);
  };

  const handleSelect = async (item: TmdbMovie | TmdbTvShow) => {
    const id = (item as any).id;
    setSelectedId(id);
    try {
      const d = type === "movie" ? await getMovieDetails(id) : await getTvShowDetails(id);
      setDetails(d);
    } catch { setDetails(null); }
  };

  const handleAdd = () => {
    if (!details) return;
    setAdding(true);
    const title = details.title || details.name || "";
    const year = (details.release_date || details.first_air_date || "").substring(0, 4);
    const poster = details.poster_path || "";
    const entry: AdminMovie | AdminSeries = {
      id: uuid(),
      tmdbId: details.id,
      title,
      year,
      poster,
      createdAt: new Date().toISOString(),
      ...(type === "tv" ? { seasons: details.number_of_seasons || 0, episodes: details.number_of_episodes || 0 } : {}),
    } as any;
    const key = type === "movie" ? LS_KEYS.movies : LS_KEYS.series;
    const existing = loadFromLS<typeof entry[]>(key, []);
    if (existing.find((e) => e.tmdbId === entry.tmdbId)) {
      setAdding(false);
      alert("هذا الفيلم/المسلسل موجود بالفعل!");
      return;
    }
    existing.push(entry);
    saveToLS(key, existing);
    setAdding(false);
    onSelect();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h3 className="text-lg font-bold">إضافة {type === "movie" ? "فيلم" : "مسلسل"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") search(); }}
              placeholder="بحث باسم الفيلم أو المسلسل..."
              className="flex-1 bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
            <button onClick={search} disabled={loading}
              className="bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              بحث
            </button>
          </div>

          {results.length > 0 && !details && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((item: any) => (
                <button key={item.id} onClick={() => handleSelect(item)}
                  className={`bg-[#0f0f0f] rounded-xl overflow-hidden border transition-all text-right ${
                    selectedId === item.id ? "border-red-500 ring-1 ring-red-500" : "border-gray-800 hover:border-gray-600"
                  }`}>
                  <div className="aspect-[2/3] bg-gray-900">
                    {item.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} alt={item.title || item.name}
                        className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Film className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-white truncate">{item.title || item.name}</p>
                    <p className="text-[10px] text-gray-500">{(item.release_date || item.first_air_date || "").substring(0, 4)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {details && (
            <div className="bg-[#0f0f0f] rounded-xl p-4 border border-gray-800">
              <div className="flex gap-4">
                <div className="w-24 shrink-0">
                  {details.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w185${details.poster_path}`} alt={details.title || details.name}
                      className="rounded-lg w-full" />
                  ) : (
                    <div className="aspect-[2/3] bg-gray-800 rounded-lg flex items-center justify-center">
                      <Film className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{details.title || details.name}</h4>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-3">{details.overview}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {(details.release_date || details.first_air_date || "").substring(0, 4)}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {details.vote_average?.toFixed(1)}</span>
                    {type === "tv" && (
                      <>
                        <span className="flex items-center gap-1"><Tv className="w-3 h-3" /> {details.number_of_seasons} مواسم</span>
                        <span className="flex items-center gap-1"><Film className="w-3 h-3" /> {details.number_of_episodes} حلقة</span>
                      </>
                    )}
                  </div>
                  <button onClick={handleAdd} disabled={adding}
                    className="mt-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    إضافة {type === "movie" ? "الفيلم" : "المسلسل"} للموقع
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Movies Section ─── */
function MoviesSection({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [movies, setMovies] = useState<AdminMovie[]>(() => loadFromLS(LS_KEYS.movies, []));
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setMovies(loadFromLS(LS_KEYS.movies, []));

  const remove = (id: string) => {
    const updated = movies.filter((m) => m.id !== id);
    saveToLS(LS_KEYS.movies, updated);
    setMovies(updated);
    showToast("تم حذف الفيلم");
  };

  const links = loadFromLS<StreamLink[]>(LS_KEYS.links, []);

  return (
    <div>
      {showModal && <TmdbSearchModal type="movie" onSelect={() => { refresh(); setShowModal(false); showToast("تم إضافة الفيلم بنجاح"); }} onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">الأفلام</h2>
        <button onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> إضافة فيلم
        </button>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#1a1a1a] rounded-2xl border border-gray-800">
          <Film className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد أفلام مضافة</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs">
                  <th className="text-right py-3 px-4">البوستر</th>
                  <th className="text-right py-3 px-4">الاسم</th>
                  <th className="text-right py-3 px-4">السنة</th>
                  <th className="text-right py-3 px-4">روابط البث</th>
                  <th className="text-left py-3 px-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-4">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-800">
                        {m.poster ? <img src={`https://image.tmdb.org/t/p/w92${m.poster}`} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-gray-600" /></div>}
                      </div>
                    </td>
                    <td className="py-2 px-4 font-medium">{m.title}</td>
                    <td className="py-2 px-4 text-gray-400">{m.year}</td>
                    <td className="py-2 px-4">
                      <span className="bg-red-600/20 text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {links.filter((l) => l.mediaId === m.id).length}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <button onClick={() => remove(m.id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-600/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Series Section ─── */
function SeriesSection({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [series, setSeries] = useState<AdminSeries[]>(() => loadFromLS(LS_KEYS.series, []));
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setSeries(loadFromLS(LS_KEYS.series, []));

  const remove = (id: string) => {
    const updated = series.filter((s) => s.id !== id);
    saveToLS(LS_KEYS.series, updated);
    setSeries(updated);
    showToast("تم حذف المسلسل");
  };

  const links = loadFromLS<StreamLink[]>(LS_KEYS.links, []);

  return (
    <div>
      {showModal && <TmdbSearchModal type="tv" onSelect={() => { refresh(); setShowModal(false); showToast("تم إضافة المسلسل بنجاح"); }} onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">المسلسلات</h2>
        <button onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> إضافة مسلسل
        </button>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#1a1a1a] rounded-2xl border border-gray-800">
          <Tv className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد مسلسلات مضافة</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs">
                  <th className="text-right py-3 px-4">البوستر</th>
                  <th className="text-right py-3 px-4">الاسم</th>
                  <th className="text-right py-3 px-4">السنة</th>
                  <th className="text-right py-3 px-4">المواسم</th>
                  <th className="text-right py-3 px-4">روابط البث</th>
                  <th className="text-left py-3 px-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="py-2 px-4">
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-800">
                        {s.poster ? <img src={`https://image.tmdb.org/t/p/w92${s.poster}`} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Tv className="w-4 h-4 text-gray-600" /></div>}
                      </div>
                    </td>
                    <td className="py-2 px-4 font-medium">{s.title}</td>
                    <td className="py-2 px-4 text-gray-400">{s.year}</td>
                    <td className="py-2 px-4 text-gray-400">{s.seasons} موسم / {s.episodes} حلقة</td>
                    <td className="py-2 px-4">
                      <span className="bg-purple-600/20 text-purple-400 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {links.filter((l) => l.mediaId === s.id).length}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <button onClick={() => remove(s.id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-600/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Links Section ─── */
function LinksSection({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [links, setLinks] = useState<StreamLink[]>(() => loadFromLS(LS_KEYS.links, []));
  const [mediaId, setMediaId] = useState("");
  const [serverName, setServerName] = useState("");
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("720p");
  const [language, setLanguage] = useState("عربي");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const movies = loadFromLS<AdminMovie[]>(LS_KEYS.movies, []);
  const series = loadFromLS<AdminSeries[]>(LS_KEYS.series, []);
  const allMedia = [
    ...movies.map((m) => ({ id: m.id, title: m.title, type: "movie" as const })),
    ...series.map((s) => ({ id: s.id, title: s.title, type: "series" as const })),
  ];

  const addLink = () => {
    if (!mediaId || !url.trim() || !serverName.trim()) {
      showToast("يرجى ملء جميع الحقول", "error");
      return;
    }
    const media = allMedia.find((m) => m.id === mediaId);
    const link: StreamLink = {
      id: uuid(),
      mediaId,
      mediaTitle: media?.title || "",
      mediaType: media?.type || "movie",
      serverName: serverName.trim(),
      url: url.trim(),
      quality,
      language,
      createdAt: new Date().toISOString(),
    };
    const updated = [link, ...links];
    saveToLS(LS_KEYS.links, updated);
    setLinks(updated);
    setServerName("");
    setUrl("");
    showToast("تم إضافة رابط البث");
  };

  const removeLink = (id: string) => {
    const updated = links.filter((l) => l.id !== id);
    saveToLS(LS_KEYS.links, updated);
    setLinks(updated);
    showToast("تم حذف الرابط");
  };

  const qualities = ["360p", "480p", "720p", "1080p", "4K"];
  const languages = ["عربي", "إنجليزي", "مدبلج", "مترجم"];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">روابط البث</h2>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <iframe src={previewUrl} className="w-full h-full" allowFullScreen />
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-gray-800 mb-6">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-400" />
          إضافة رابط بث جديد
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">الفيلم / المسلسل</label>
            <select value={mediaId} onChange={(e) => setMediaId(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500">
              <option value="">اختر...</option>
              {allMedia.map((m) => (
                <option key={m.id} value={m.id}>{m.title} ({m.type === "movie" ? "فيلم" : "مسلسل"})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">اسم السيرفر</label>
            <input value={serverName} onChange={(e) => setServerName(e.target.value)}
              placeholder="مثال: سيرفر 1, سيرفر HD"
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">رابط البث</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">الجودة</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500">
              {qualities.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">اللغة</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500">
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={addLink}
              className="w-full bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> إضافة الرابط
            </button>
          </div>
        </div>
      </div>

      {/* Links table */}
      {links.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#1a1a1a] rounded-2xl border border-gray-800">
          <Link2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>لا توجد روابط بث مضافة</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs">
                  <th className="text-right py-3 px-4">المحتوى</th>
                  <th className="text-right py-3 px-4">السيرفر</th>
                  <th className="text-right py-3 px-4">الجودة</th>
                  <th className="text-right py-3 px-4">اللغة</th>
                  <th className="text-left py-3 px-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{link.mediaTitle}</p>
                        <p className="text-[10px] text-gray-500">{link.mediaType === "movie" ? "فيلم" : "مسلسل"}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-gray-500" /> {link.serverName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold">{link.quality}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-gray-500" /> {link.language}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setPreviewUrl(link.url)}
                          className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-600/10 rounded-lg transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeLink(link.id)}
                          className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-600/10 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Settings Section ─── */
function SettingsSection({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [settings, setSettings] = useState<AdminSettings>(() => loadFromLS(LS_KEYS.settings, { siteName: "سينمورا" }));
  const [siteName, setSiteName] = useState(settings.siteName);

  const save = () => {
    const updated: AdminSettings = { siteName };
    saveToLS(LS_KEYS.settings, updated);
    setSettings(updated);
    showToast("تم حفظ الإعدادات");
  };

  const clearAll = () => {
    if (!confirm("هل أنت متأكد؟ سيتم مسح كل البيانات المخزنة محلياً!")) return;
    localStorage.removeItem(LS_KEYS.movies);
    localStorage.removeItem(LS_KEYS.series);
    localStorage.removeItem(LS_KEYS.links);
    showToast("تم مسح كل البيانات");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">الإعدادات</h2>

      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 space-y-6 max-w-xl">
        <div>
          <label className="block text-sm font-bold mb-2">اسم الموقع</label>
          <input value={siteName} onChange={(e) => setSiteName(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500" />
        </div>

        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2">مفتاح TMDB API مضبوط في متغيرات البيئة (VITE_TMDB_API_KEY)</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-800">
          <button onClick={save}
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
            حفظ الإعدادات
          </button>
          <button onClick={clearAll}
            className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-6 py-2.5 rounded-xl text-sm font-bold transition-all">
            مسح كل البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
