export const addToWatchHistory = (item: {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string;
}) => {
  const stored = localStorage.getItem("watch_history");
  const history = stored ? JSON.parse(stored) : [];

  const filtered = history.filter(
    (h: any) => !(h.id === item.id && h.type === item.type),
  );

  const updated = [{ ...item, watchedAt: Date.now() }, ...filtered].slice(
    0,
    50,
  );

  localStorage.setItem("watch_history", JSON.stringify(updated));
};
