import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
}

function decodeToken(token: string): User | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      id: json.id || "",
      email: json.email || "",
      name: json.name || "",
      role: json.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  googleLogin: () => void;
  discordLogin: () => void;
  handleToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || "https://api.cinemoratv.online";
const API_URL = `${ENGINE_URL}/api`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) return decodeToken(token);
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (token: string) => {
    const localUser = decodeToken(token);
    if (localUser) setUser(localUser);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        return false;
      }
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [fetchUser]);

  const handleToken = (token: string) => {
    localStorage.setItem("token", token);
    const localUser = decodeToken(token);
    if (localUser) setUser(localUser);
    return fetchUser(token);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        setUser(data.user || decodeToken(data.token));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "فشل الاتصال بالخادم" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        setUser(data.user || decodeToken(data.token));
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "فشل الاتصال بالخادم" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const googleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const discordLogin = () => {
    window.location.href = `${API_URL}/auth/discord`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, discordLogin, handleToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
