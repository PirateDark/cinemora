const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || "";
const API_BASE = `${ENGINE_URL}/api`;

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  if (!ENGINE_URL) throw new Error("VITE_ENGINE_URL is not set");
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

// ─── Favorites ───────────────────────────────
export async function fetchFavorites(): Promise<any[]> {
  try {
    if (!ENGINE_URL) return [];
    const res = await authFetch("/media/favorites");
    const data = await res.json();
    return data.success ? data.items : [];
  } catch { return []; }
}

export async function addFavorite(tmdbId: string): Promise<boolean> {
  try {
    if (!ENGINE_URL) return false;
    const res = await authFetch("/media/favorites/add", {
      method: "POST",
      body: JSON.stringify({ tmdbId }),
    });
    return (await res.json()).success;
  } catch { return false; }
}

export async function removeFavorite(tmdbId: string): Promise<boolean> {
  try {
    if (!ENGINE_URL) return false;
    const res = await authFetch(`/media/favorites/remove/${tmdbId}`, { method: "DELETE" });
    return (await res.json()).success;
  } catch { return false; }
}

// ─── Watchlist ───────────────────────────────
export async function fetchWatchlist(): Promise<any[]> {
  try {
    if (!ENGINE_URL) return [];
    const res = await authFetch("/media/watchlist");
    const data = await res.json();
    return data.success ? data.items : [];
  } catch { return []; }
}

export async function addToWatchlist(tmdbId: string): Promise<boolean> {
  try {
    if (!ENGINE_URL) return false;
    const res = await authFetch("/media/watchlist/add", {
      method: "POST",
      body: JSON.stringify({ tmdbId }),
    });
    return (await res.json()).success;
  } catch { return false; }
}

export async function removeFromWatchlist(tmdbId: string): Promise<boolean> {
  try {
    if (!ENGINE_URL) return false;
    const res = await authFetch(`/media/watchlist/remove/${tmdbId}`, { method: "DELETE" });
    return (await res.json()).success;
  } catch { return false; }
}

// ─── Watch History ───────────────────────────
export async function fetchWatchHistory(): Promise<any[]> {
  try {
    if (!ENGINE_URL) return [];
    const res = await authFetch("/media/watch/history");
    const data = await res.json();
    return data.success ? data.history : [];
  } catch { return []; }
}

export async function startWatching(tmdbId: string, episodeId?: string): Promise<boolean> {
  try {
    if (!ENGINE_URL) return false;
    const res = await authFetch("/media/watch/start", {
      method: "POST",
      body: JSON.stringify({ tmdbId, episodeId }),
    });
    return (await res.json()).success;
  } catch { return false; }
}

export async function updateWatchProgress(tmdbId: string, progress: number, duration: number, episodeId?: string): Promise<boolean> {
  try {
    if (!ENGINE_URL) return false;
    const res = await authFetch("/media/watch/progress", {
      method: "POST",
      body: JSON.stringify({ tmdbId, episodeId, progress, duration }),
    });
    return (await res.json()).success;
  } catch { return false; }
}

// ─── Media helpers ───────────────────────────
export function findMediaId(items: any[], tmdbId: number): string | null {
  if (!ENGINE_URL) return null;
  for (const item of items) {
    const m = item.media || item;
    if (parseInt(m.tmdbId || m.id) === tmdbId || parseInt(m.tmdbId) === tmdbId) return m.id;
  }
  return null;
}
