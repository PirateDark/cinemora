import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { setToken } from "../services/auth";
import { Loader2, AlertCircle } from "lucide-react";
import SEO from "../components/SEO";

function extractToken(): string | null {
  const href = window.location.href;
  const search = window.location.search;
  const hash = window.location.hash;

  const params = new URLSearchParams(search);
  const fromSearch =
    params.get("token") ||
    params.get("access_token") ||
    params.get("id_token");

  if (fromSearch) return fromSearch;

  const fromHashToken = hash.match(/[#&]token=([^&]+)/);
  if (fromHashToken) return fromHashToken[1];

  const fromHashAccess = hash.match(/[#&]access_token=([^&]+)/);
  if (fromHashAccess) return fromHashAccess[1];

  const fromHashId = hash.match(/[#&]id_token=([^&]+)/);
  if (fromHashId) return fromHashId[1];

  const allParams = href.split("?")[1]?.split("&") || [];
  for (const p of allParams) {
    const [k, v] = p.split("=");
    if (k === "token" || k === "access_token" || k === "id_token") {
      return decodeURIComponent(v);
    }
  }

  return null;
}

export default function AuthCallback() {
  const { handleToken } = useAuth();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = extractToken();
    const error = params.get("error");
    const code = params.get("code");

    if (error) {
      setStatus(`error: ${error}`);
      setTimeout(() => { window.location.href = `/login?error=${encodeURIComponent(error)}`; }, 2000);
      return;
    }

    if (code) {
      const path = window.location.pathname;
      const engineUrl = import.meta.env.VITE_ENGINE_URL || "https://api.cinemoratv.online";
      let vpsUrl = "";

      if (path === "/auth/callback/google") {
        vpsUrl = `${engineUrl}/api/auth/google/callback?code=${encodeURIComponent(code)}`;
      } else if (path === "/auth/callback/discord") {
        vpsUrl = `${engineUrl}/api/auth/discord/callback?code=${encodeURIComponent(code)}`;
      }

      window.location.href = vpsUrl;
      return;
    }

    if (!token) {
      setStatus("no_token");
      setTimeout(() => { window.location.href = "/login?error=no_token"; }, 3000);
      return;
    }

    setStatus("saving");
    setToken(token);
    handleToken(token);
    window.location.href = "/";
  }, []);

  return (
    <>
      <SEO title="تسجيل الدخول" />
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-lg">
        {status === "processing" && (
          <>
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">جاري تسجيل الدخول...</p>
          </>
        )}
        {status === "no_token" && (
          <>
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
            <p className="text-gray-300 font-bold mb-2">لم يتم العثور على رمز الدخول</p>
            <p className="text-gray-500 text-xs mb-4 break-all ltr">{window.location.href}</p>
            <p className="text-gray-600 text-xs">سيتم إعادة التوجيه إلى صفحة تسجيل الدخول...</p>
          </>
        )}
        {status.startsWith("error:") && (
          <>
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <p className="text-gray-300 font-bold mb-2">حدث خطأ في تسجيل الدخول</p>
            <p className="text-gray-500 text-xs">{status.replace("error: ", "")}</p>
          </>
        )}
      </div>
    </div>
    </>
  );
}
