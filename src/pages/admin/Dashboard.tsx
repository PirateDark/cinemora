import { useState, useEffect, useCallback } from "react";
import { getToken, logout } from "../../services/auth";
import { Loader2, Check, Trash2, Plus, Shield, AlertCircle, ExternalLink } from "lucide-react";

const API = "https://api.cinemoratv.online/api/admin";

interface Draft {
  id: string;
  url: string;
  title: string;
  poster?: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const headers = useCallback(() => {
    const token = getToken();
    if (!token) {
      logout();
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchDrafts = useCallback(async () => {
    const h = headers();
    if (!h) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/drafts`, { headers: h });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (data.success) setDrafts(data.drafts || []);
      else setError(data.error || "فشل تحميل المسودات");
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  const handleFetch = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const h = headers();
    if (!h) return;
    setFetching(true);
    setError("");
    try {
      const res = await fetch(`${API}/fetch`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ url: trimmed }),
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (data.success) {
        setUrl("");
        fetchDrafts();
      } else {
        setError(data.error || "فشل جلب المحتوى");
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async (id: string) => {
    const h = headers();
    if (!h) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API}/drafts/${id}/approve`, {
        method: "POST",
        headers: h,
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (data.success) fetchDrafts();
      else setError(data.error || "فشل الموافقة");
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    const h = headers();
    if (!h) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API}/drafts/${id}`, {
        method: "DELETE",
        headers: h,
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (data.success) fetchDrafts();
      else setError(data.error || "فشل الحذف");
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" dir="rtl">
      <div className="max-w-6xl mx-auto py-8 px-4 animate-fadeIn">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-center tracking-tight"
              style={{ textShadow: "0 0 20px rgba(244,63,94,0.5), 0 0 40px rgba(244,63,94,0.2)" }}>
            <span className="bg-gradient-to-l from-rose-500 to-rose-300 bg-clip-text text-transparent">
              Cinemora Admin
            </span>
          </h1>
          <p className="text-gray-500 text-sm text-center mt-2">إدارة المحتوى والمسودات</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-600/15 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Scraper Section */}
        <div className="bg-[#111] border border-rose-500/20 rounded-2xl p-6 mb-8 shadow-lg shadow-rose-500/5">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-400" />
            جلب محتوى جديد
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleFetch(); }}
              placeholder="الصق رابط الفيلم أو المسلسل من موقع عربي..."
              className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-rose-500/50 transition-all text-base"
            />
            <button
              onClick={handleFetch}
              disabled={fetching || !url.trim()}
              className="bg-rose-600 hover:bg-rose-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:shadow-none min-w-[140px]"
            >
              {fetching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
              {fetching ? "جاري الجلب..." : "جلب المحتوى"}
            </button>
          </div>
        </div>

        {/* Drafts Grid */}
        <div className="bg-[#111] border border-rose-500/20 rounded-2xl p-6 shadow-lg shadow-rose-500/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-400" />
              المسودات
              <span className="text-gray-500 text-sm font-normal">({drafts.length})</span>
            </h2>
            <button
              onClick={fetchDrafts}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-800"
            >
              تحديث
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-20">
              <Shield className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد مسودات</p>
              <p className="text-gray-600 text-sm mt-1">استخدم مربع الجلب أعلاه لإضافة محتوى جديد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden transition-all hover:border-rose-500/30 group"
                >
                  {/* Poster */}
                  <div className="aspect-[2/3] bg-gray-900 relative overflow-hidden">
                    {draft.poster ? (
                      <img
                        src={draft.poster}
                        alt={draft.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shield className="w-10 h-10 text-gray-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-white line-clamp-2 mb-3 leading-relaxed">
                      {draft.title || "بدون عنوان"}
                    </h3>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(draft.id)}
                        disabled={actionLoading === draft.id}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all active:scale-95"
                      >
                        {actionLoading === draft.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        موافقة
                      </button>
                      <button
                        onClick={() => handleDelete(draft.id)}
                        disabled={actionLoading === draft.id}
                        className="flex items-center justify-center gap-1.5 bg-red-600/20 hover:bg-red-600/40 disabled:opacity-40 text-red-400 text-xs font-bold px-3 py-2 rounded-lg transition-all active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
