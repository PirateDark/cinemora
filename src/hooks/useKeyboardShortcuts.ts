import { useEffect, useRef } from "react";

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      const key = e.key.toLowerCase();
      if (ref.current[key]) {
        ref.current[key]();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
