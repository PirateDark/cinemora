const API_BASE = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:5555/api/admin";

export async function fetchAddMovie(tmdbId: string) {
  const res = await fetch(`${API_BASE}/movies/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tmdbId }),
  });
  return res.json();
}

export async function fetchMovies(category?: string) {
  const url = category ? `${API_BASE}/movies?category=${category}` : `${API_BASE}/movies`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchDeleteMovie(id: string) {
  const res = await fetch(`${API_BASE}/movies/${id}`, { method: "DELETE" });
  return res.json();
}

export async function verifyAdminKey(key: string) {
  const res = await fetch(`${API_BASE}/verify-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  return res.json();
}
