import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "user" | "admin";
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

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || "http://51.254.207.214:5555";
const API_URL = `${ENGINE_URL}/api`;
const AUTH_URL = ENGINE_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (token: string) => {
    console.log("AuthContext: Token found:", !!token);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        console.log("AuthContext: 401 Unauthorized, removing token");
        localStorage.removeItem("token");
        return false;
      }
      const data = await res.json();
      console.log("AuthContext: User fetched:", data.success, data.user);
      if (data.success) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      console.log("AuthContext: Network error fetching user, keeping token for retry");
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const handleToken = async (token: string) => {
    localStorage.setItem("token", token);
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
        setUser(data.user);
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
        setUser(data.user);
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
    window.location.href = `${AUTH_URL}/auth/google`;
  };

  const discordLogin = () => {
    window.location.href = `${AUTH_URL}/auth/discord`;
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
