const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || "";
const API_BASE = `${ENGINE_URL}/api/admin`;

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const adminKey = localStorage.getItem("admin_key");
  if (adminKey) headers["x-admin-key"] = adminKey;
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchAddMovie(tmdbId: string) {
  const res = await fetch(`${API_BASE}/media/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ tmdbId }),
  });
  return res.json();
}

export async function fetchMovies(category?: string) {
  const url = category ? `${API_BASE}/media?category=${category}` : `${API_BASE}/media`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return res.json();
}

export async function fetchDeleteMovie(id: string) {
  const res = await fetch(`${API_BASE}/media/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function verifyAdminKey(key: string) {
  localStorage.setItem("admin_key", key);
  const res = await fetch(`${API_BASE}/verify-key`, {
    method: "POST",
    headers: { "x-admin-key": key },
  });
  return res.json();
}

// ─── Media Detail ────────────────────────────
export async function fetchMediaDetail(id: string) {
  const res = await fetch(`${API_BASE}/media/${id}`, { headers: getAuthHeaders() });
  return res.json();
}

// ─── Episodes ────────────────────────────────
export async function fetchAddEpisode(mediaId: string, seasonNumber: number, episodeNumber: number, title: string) {
  const res = await fetch(`${API_BASE}/episodes/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ mediaId, episodes: [{ seasonNumber, episodeNumber, title }] }),
  });
  return res.json();
}

export async function fetchDeleteEpisode(id: string) {
  const res = await fetch(`${API_BASE}/episodes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ─── Server Links ────────────────────────────
export async function fetchAddServerLink(mediaId: string, url: string, server: string, label: string, type = "iframe", priority = 0, episodeId?: string) {
  const res = await fetch(`${API_BASE}/server-links/add`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ mediaId, episodeId, server, label, url, type, priority }),
  });
  return res.json();
}

export async function fetchDeleteServerLink(id: string) {
  const res = await fetch(`${API_BASE}/server-links/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}
