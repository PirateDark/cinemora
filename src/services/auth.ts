const TOKEN_KEY = "token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function logout(): void {
  removeToken();
  window.location.href = "/";
}

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  const token = getToken();
  if (!token) return false;
  const payload = decodePayload(token);
  return payload?.role?.toString()?.toLowerCase() === "admin";
}
