import { Link } from "react-router-dom";
import { Shield, Bookmark, Heart, LogOut } from "lucide-react";
import { logout as authLogout } from "../services/auth";

interface UserMenuUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
}

interface UserMenuProps {
  user: UserMenuUser | null;
  onClose: () => void;
}

export default function UserMenu({ user, onClose }: UserMenuProps) {
  return (
    <div
      className="absolute top-full left-0 mt-2 w-56 overflow-hidden animate-fadeIn"
      style={{
        background: "#111111",
        zIndex: 9999,
        border: "1px solid rgba(244, 63, 94, 0.6)",
        borderRadius: "0.75rem",
        boxShadow: "0 0 20px rgba(244, 63, 94, 0.25), 0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-white text-sm font-medium truncate">{user?.name || "المستخدم"}</p>
        <p className="text-gray-500 text-xs truncate">{user?.email || ""}</p>
      </div>

      <div className="py-1">
        {user?.role === "admin" && (
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Shield className="w-4 h-4 text-rose-400" />
            لوحة التحكم
          </Link>
        )}
        <Link
          to="/watchlist"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Bookmark className="w-4 h-4 text-amber-400" />
          قائمة المشاهدة
        </Link>
        <Link
          to="/favorites"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Heart className="w-4 h-4 text-red-400" />
          المفضلة
        </Link>
      </div>

      <div className="border-t border-gray-800 py-1">
        <button
          onClick={() => { authLogout(); onClose(); }}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/10 transition-colors w-full text-right"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
