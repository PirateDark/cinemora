const cache = new Map<string, string>();

export async function translateToArabic(text: string): Promise<string> {
  if (!text || text.length < 20) return text;

  const cacheKey = `trans_${text.slice(0, 100)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const stored = localStorage.getItem(cacheKey);
  if (stored) {
    cache.set(cacheKey, stored);
    return stored;
  }

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|ar`,
    );
    const data = await res.json();
    const translated = data.responseData?.translatedText || text;

    cache.set(cacheKey, translated);
    try { localStorage.setItem(cacheKey, translated); } catch { /* ignore */ }

    return translated;
  } catch {
    return text;
  }
}
