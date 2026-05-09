const PROXY_BASE = "http://51.254.207.214:5555";

export interface SourceInfo {
  name: string;
  url: string;
}

export const getVideoSources = async (
  type: "movie" | "tv",
  id: string,
  season?: number,
  episode?: number,
): Promise<SourceInfo[]> => {
  try {
    const response = await fetch(`${PROXY_BASE}/api/sources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, season, episode }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.sources || [];
  } catch {
    return [];
  }
};

export const getVideoSource = async (
  type: "movie" | "tv",
  id: string,
  season?: number,
  episode?: number,
): Promise<SourceInfo | null> => {
  const sources = await getVideoSources(type, id, season, episode);
  return sources[0] || null;
};
