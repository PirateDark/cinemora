import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/Toast";
import {
  fetchAddMovie,
  fetchMovies,
  fetchDeleteMovie,
  fetchMediaDetail,
  fetchAddEpisode,
  fetchDeleteEpisode,
  fetchAddServerLink,
  fetchDeleteServerLink,
} from "../services/adminApi";
import {
  Film,
  Tv,
  Trash2,
  Plus,
  Shield,
  ShieldOff,
  Loader2,
  ImageOff,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Clapperboard,
} from "lucide-react";

interface MovieItem {
  id: string;
  tmdbId: string;
  title: string;
  arabicTitle?: string;
  description: string;
  posterPath: string;
  category: string;
  createdAt: string;
  _count?: { episodes: number; serverLinks: number };
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tmdbId, setTmdbId] = useState("");
  const [adding, setAdding] = useState(false);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [newEpisode, setNewEpisode] = useState({ season: "1", episode: "1", title: "" });
  const [newLink, setNewLink] = useState({ server: "custom", label: "", url: "", type: "iframe", priority: "0", episodeId: "" });
  const [submittingEp, setSubmittingEp] = useState(false);
  const [submittingLink, setSubmittingLink] = useState(false);
  const [deletingEp, setDeletingEp] = useState<string | null>(null);
  const [deletingLink, setDeletingLink] = useState<string | null>(null);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMovies();
      if (result.success) {
        setMovies(result.items || []);
      } else {
        toast("فشل في تحميل البيانات من قاعدة البيانات");
      }
    } catch {
      toast("تعذر الاتصال بقاعدة البيانات");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === "admin") loadMovies();
  }, [user, authLoading, loadMovies]);

  const handleAdd = async () => {
    const id = tmdbId.trim();
    if (!id) {
      toast("الرجاء إدخال معرف TMDB");
      return;
    }
    if (!/^\d+$/.test(id)) {
      toast("معرف TMDB يجب أن يكون رقماً");
      return;
    }
    setAdding(true);
    try {
      const result = await fetchAddMovie(id);
      if (result.success) {
        toast("تم إضافة المحتوى بنجاح");
        setTmdbId("");
        loadMovies();
      } else {
        toast(result.error || "فشل في إضافة المحتوى");
      }
    } catch {
      toast("تعذر الاتصال بقاعدة البيانات");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (movieId: string) => {
    setDeleting(movieId);
    try {
      const result = await fetchDeleteMovie(movieId);
      if (result.success) {
        toast("تم حذف المحتوى بنجاح");
        loadMovies();
      } else {
        toast(result.error || "فشل في حذف المحتوى");
      }
    } catch {
      toast("تعذر الاتصال بقاعدة البيانات");
    } finally {
      setDeleting(null);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    setExpandedId(id);
    setExpandedLoading(true);
    try {
      const result = await fetchMediaDetail(id);
      if (result.success) setExpandedData(result.media);
    } catch {}
    setExpandedLoading(false);
  };

  const handleAddEpisode = async (mediaId: string) => {
    if (!newEpisode.title.trim() || !newEpisode.season || !newEpisode.episode) {
      toast("الرجاء ملء جميع الحقول");
      return;
    }
    setSubmittingEp(true);
    try {
      const result = await fetchAddEpisode(mediaId, parseInt(newEpisode.season), parseInt(newEpisode.episode), newEpisode.title.trim());
      if (result.success) {
        toast("تم إضافة الحلقة");
        setNewEpisode({ season: "1", episode: "1", title: "" });
        toggleExpand(mediaId);
      } else {
        toast(result.error || "فشل في الإضافة");
      }
    } catch {
      toast("تعذر الاتصال");
    }
    setSubmittingEp(false);
  };

  const handleDeleteEpisode = async (episodeId: string, mediaId: string) => {
    setDeletingEp(episodeId);
    try {
      const result = await fetchDeleteEpisode(episodeId);
      if (result.success) {
        toast("تم حذف الحلقة");
        toggleExpand(mediaId);
      }
    } catch {}
    setDeletingEp(null);
  };

  const handleAddLink = async (mediaId: string) => {
    if (!newLink.url.trim() || !newLink.label.trim()) {
      toast("الرابط والاسم مطلوبان");
      return;
    }
    setSubmittingLink(true);
    try {
      const result = await fetchAddServerLink(mediaId, newLink.url.trim(), newLink.server, newLink.label.trim(), newLink.type, parseInt(newLink.priority) || 0, newLink.episodeId || undefined);
      if (result.success) {
        toast("تم إضافة الرابط");
        setNewLink({ server: "custom", label: "", url: "", type: "iframe", priority: "0", episodeId: "" });
        toggleExpand(mediaId);
      } else {
        toast(result.error || "فشل في الإضافة");
      }
    } catch {
      toast("تعذر الاتصال");
    }
    setSubmittingLink(false);
  };

  const handleDeleteLink = async (linkId: string, mediaId: string) => {
    setDeletingLink(linkId);
    try {
      const result = await fetchDeleteServerLink(linkId);
      if (result.success) {
        toast("تم حذف الرابط");
        toggleExpand(mediaId);
      }
    } catch {}
    setDeletingLink(null);
  };

  const stats = {
    movies: movies.filter((m) => m.category === "movie").length,
    series: movies.filter((m) => m.category === "series" || m.category === "anime").length,
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-6">
            <ShieldOff className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">غير مصرح</h1>
          <p className="text-gray-400 mb-6">ليس لديك صلاحية الوصول إلى هذه الصفحة</p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة إلى الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 animate-fadeIn" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-rose-400" />
            لوحة التحكم
          </h1>
          <p className="text-gray-400 text-sm mt-1">مرحباً، {user.name} — إدارة محتوى سينمورا</p>
        </div>
        <button
          onClick={loadMovies}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors border border-gray-700/50"
        >
          تحديث
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center shrink-0">
            <Film className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.movies}</p>
            <p className="text-gray-400 text-sm">إجمالي الأفلام</p>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0">
            <Tv className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.series}</p>
            <p className="text-gray-400 text-sm">إجمالي المسلسلات</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-rose-400" />
          إضافة محتوى جديد
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={tmdbId}
            onChange={(e) => setTmdbId(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
            placeholder="أدخل معرف TMDB (مثال: 550)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-base"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="bg-gradient-to-l from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:shadow-none min-w-[120px]"
          >
            {adding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {adding ? "جاري..." : "إضافة"}
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-3">
          سيتم جلب بيانات الفيلم من TMDB وحفظها مع رابط التشغيل التلقائي
        </p>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-400" />
            المحتوى المضاف
            <span className="text-sm text-gray-500 font-normal">({movies.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">لا يوجد محتوى مضاف بعد</p>
            <p className="text-gray-600 text-sm mt-1">أضف فيلماً باستخدام معرف TMDB أعلاه</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="pb-3 font-medium w-14">بوستر</th>
                  <th className="pb-3 font-medium">العنوان</th>
                  <th className="pb-3 font-medium w-24">التصنيف</th>
                  <th className="pb-3 font-medium w-40 hidden sm:table-cell">الحلقات · الروابط</th>
                  <th className="pb-3 font-medium w-16"></th>
                  <th className="pb-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <React.Fragment key={movie.id}>
                    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3">
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-800 ring-1 ring-gray-700/50">
                          {movie.posterPath ? (
                            <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageOff className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-white text-sm font-medium line-clamp-2">{movie.title || movie.arabicTitle}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          movie.category === "movie" ? "bg-rose-600/20 text-rose-400" : "bg-purple-600/20 text-purple-400"
                        }`}>{movie.category === "movie" ? "فيلم" : "مسلسل"}</span>
                      </td>
                      <td className="py-3 text-gray-400 text-xs hidden sm:table-cell">
                        <span className="block">{movie._count?.episodes || 0} حلقات · {movie._count?.serverLinks || 0} روابط</span>
                        <span className="block text-gray-500">{new Date(movie.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </td>
                      <td className="py-3">
                        <button onClick={() => handleDelete(movie.id)} disabled={deleting === movie.id}
                          className="p-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50 transition-colors" title="حذف">
                          {deleting === movie.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3">
                        <button onClick={() => toggleExpand(movie.id)}
                          className="p-2 rounded-lg bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="إدارة">
                          {expandedId === movie.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === movie.id && (
                      <tr>
                        <td colSpan={6} className="p-4 bg-gray-900/50 border-b border-gray-800/50">
                          {expandedLoading ? (
                            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 text-rose-400 animate-spin" /></div>
                          ) : expandedData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Episodes */}
                              <div>
                                <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                                  <Clapperboard className="w-4 h-4 text-rose-400" /> الحلقات ({expandedData.episodes?.length || 0})
                                </h4>
                                {expandedData.episodes?.length > 0 && (
                                  <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                                    {expandedData.episodes.map((ep: any) => (
                                      <div key={ep.id} className="flex items-center justify-between bg-gray-800/50 px-3 py-1.5 rounded-lg text-xs">
                                        <span className="text-gray-300">S{ep.seasonNumber}E{ep.episodeNumber} — {ep.title || "بدون عنوان"}</span>
                                        <button onClick={() => handleDeleteEpisode(ep.id, movie.id)} disabled={deletingEp === ep.id}
                                          className="p-1 rounded text-red-400 hover:bg-red-600/20 disabled:opacity-40">
                                          {deletingEp === ep.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <input type="number" value={newEpisode.season} onChange={(e) => setNewEpisode({ ...newEpisode, season: e.target.value })}
                                    className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs text-center" placeholder="S" />
                                  <input type="number" value={newEpisode.episode} onChange={(e) => setNewEpisode({ ...newEpisode, episode: e.target.value })}
                                    className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs text-center" placeholder="E" />
                                  <input type="text" value={newEpisode.title} onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                                    className="flex-1 min-w-[120px] bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs" placeholder="عنوان الحلقة" />
                                  <button onClick={() => handleAddEpisode(movie.id)} disabled={submittingEp}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-700 text-white text-xs rounded-lg transition flex items-center gap-1">
                                    {submittingEp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} إضافة
                                  </button>
                                </div>
                              </div>

                              {/* Server Links */}
                              <div>
                                <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                                  <LinkIcon className="w-4 h-4 text-blue-400" /> روابط السيرفرات ({expandedData.serverLinks?.length || 0})
                                </h4>
                                {expandedData.serverLinks?.length > 0 && (
                                  <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                                    {expandedData.serverLinks.map((lnk: any) => (
                                      <div key={lnk.id} className="flex items-center justify-between bg-gray-800/50 px-3 py-1.5 rounded-lg text-xs">
                                        <span className="text-gray-300 truncate ml-2">{lnk.label} <span className="text-gray-500">({lnk.server})</span></span>
                                        <button onClick={() => handleDeleteLink(lnk.id, movie.id)} disabled={deletingLink === lnk.id}
                                          className="p-1 rounded text-red-400 hover:bg-red-600/20 disabled:opacity-40 shrink-0">
                                          {deletingLink === lnk.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <select value={newLink.server} onChange={(e) => setNewLink({ ...newLink, server: e.target.value })}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs">
                                    <option value="custom">مخصص</option>
                                    <option value="akwam">أكوام</option>
                                    <option value="arabseed">عرب سيد</option>
                                    <option value="vidsrc">VidSrc</option>
                                    <option value="embed_su">Embed.su</option>
                                    <option value="multiembed">MultiEmbed</option>
                                  </select>
                                  <input type="text" value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                                    className="flex-1 min-w-[100px] bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs" placeholder="الاسم" />
                                  <input type="text" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs" placeholder="رابط السيرفر" />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <select value={newLink.type} onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs">
                                    <option value="iframe">Iframe</option>
                                    <option value="m3u8">M3U8</option>
                                    <option value="mp4">MP4</option>
                                  </select>
                                  <input type="number" value={newLink.priority} onChange={(e) => setNewLink({ ...newLink, priority: e.target.value })}
                                    className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-xs text-center" placeholder="0" title="الأولوية" />
                                  <button onClick={() => handleAddLink(movie.id)} disabled={submittingLink}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-xs rounded-lg transition flex items-center gap-1">
                                    {submittingLink ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} إضافة رابط
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
