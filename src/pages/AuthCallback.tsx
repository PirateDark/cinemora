import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { handleToken } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    console.log("AuthCallback: Full URL:", window.location.href);
    console.log("AuthCallback: Search Params:", window.location.search);
    console.log("AuthCallback: Hash:", window.location.hash);

    if (calledRef.current) return;

    const token =
      searchParams.get("token") ||
      searchParams.get("access_token") ||
      searchParams.get("id_token") ||
      window.location.hash.match(/[#&]token(=|&)([^&]+)/)?.[2] ||
      window.location.hash.match(/[#&]access_token(=|&)([^&]+)/)?.[2] ||
      window.location.hash.match(/[#&]id_token(=|&)([^&]+)/)?.[2];

    const error = searchParams.get("error");

    if (error) {
      console.log("AuthCallback: Error from OAuth:", error);
      window.location.href = `/login?error=${encodeURIComponent(error)}`;
      return;
    }

    if (!token) {
      console.log("AuthCallback: No token found in URL or hash");
      window.location.href = "/login?error=no_token";
      return;
    }

    calledRef.current = true;

    console.log("AuthCallback: Token found, saving to localStorage and redirecting");
    localStorage.setItem("token", token);
    handleToken(token);

    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
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
