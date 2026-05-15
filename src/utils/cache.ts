// src/utils/cache.ts

export function getCache<T>(key: string): T | null {
  const item = localStorage.getItem(`cache_${key}`);
  if (!item) return null;
  const { value, expiry } = JSON.parse(item);
  if (Date.now() > expiry) {
    localStorage.removeItem(`cache_${key}`);
    return null;
  }
  return value as T;
}

export function setCache<T>(key: string, value: T, ttl = 86400000): void {
  localStorage.setItem(
    `cache_${key}`,
    JSON.stringify({ value, expiry: Date.now() + ttl }),
  );
}
