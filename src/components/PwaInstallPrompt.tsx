import { useState, useEffect, useCallback, useRef } from "react";
import { Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches;

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);
  const installedRef = useRef(isStandalone());

  useEffect(() => {
    if (installedRef.current) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as any).__pwaInstallEvent = promptEvent;
      if (!dismissedRef.current) {
        setTimeout(() => setVisible(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      installedRef.current = true;
      setVisible(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(() => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
      setVisible(false);
    });
  }, [deferredPrompt]);

  if (installedRef.current || !visible || !deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-bounce"
      aria-label="تثبيت التطبيق"
    >
      <Download className="w-6 h-6 text-white" />
    </button>
  );
}
