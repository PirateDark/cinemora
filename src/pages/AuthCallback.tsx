import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleToken, user, loading } = useAuth();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (!token) {
      navigate("/login?error=no_token", { replace: true });
      return;
    }

    calledRef.current = true;
    handleToken(token);
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading && !user) {
      const stored = localStorage.getItem("token");
      if (stored) {
        navigate("/", { replace: true });
      }
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">جاري تسجيل الدخول...</p>
      </div>
    </div>
  );
}
