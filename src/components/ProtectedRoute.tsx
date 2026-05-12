import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: "user" | "admin";
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const hasToken = typeof window !== "undefined" && localStorage.getItem("token");

  useEffect(() => {
    if (loading) return;
    if (hasToken && !user) return;
    if (!user) {
      navigate("/login", { replace: true });
    } else if (requiredRole === "admin" && user.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, requiredRole, hasToken]);

  if (loading) return <LoadingSpinner />;
  if (hasToken && !user) return <LoadingSpinner />;
  if (!user) return null;
  if (requiredRole === "admin" && user.role !== "admin") return null;

  return <>{children}</>;
}
