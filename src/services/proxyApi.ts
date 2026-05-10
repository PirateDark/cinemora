export interface SourceInfo {
  server: string;
  label: string;
  url: string;
  type: "iframe" | "m3u8" | "mp4" | "embed";
  priority: number;
}

const ENGINE_URL = import.meta.env.VITE_ENGINE_URL || "";

export const getVideoSources = async (
  type: "movie" | "tv",
  id: string,
  season?: number,
  episode?: number,
): Promise<{ sources: SourceInfo[]; errors?: string[] }> => {
  try {
    if (!ENGINE_URL) return { sources: [] };
    const res = await fetch(`${ENGINE_URL}/api/scraper/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, season, episode }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return { sources: [] };
    return await res.json();
  } catch {
    return { sources: [] };
  }
};

export const getVideoSource = async (
  type: "movie" | "tv",
  id: string,
  season?: number,
  episode?: number,
): Promise<SourceInfo | null> => {
  const result = await getVideoSources(type, id, season, episode);
  return result.sources?.[0] || null;
};
