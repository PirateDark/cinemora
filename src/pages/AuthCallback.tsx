import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleToken } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const token =
      searchParams.get("token") ||
      searchParams.get("access_token") ||
      window.location.hash.split("token=")[1]?.split("&")[0];

    const error = searchParams.get("error");

    if (error) {
      window.location.href = `/login?error=${encodeURIComponent(error)}`;
      return;
    }

    if (!token) {
      window.location.href = "/login?error=no_token";
      return;
    }

    localStorage.setItem("token", token);
    handleToken(token);
    window.location.href = "/";
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}
