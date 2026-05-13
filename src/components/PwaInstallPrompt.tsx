import { useState, useEffect, useCallback, useRef } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches;

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showFallbackTip, setShowFallbackTip] = useState(false);
  const dismissedRef = useRef(false);
  const installedRef = useRef(isStandalone());

  useEffect(() => {
    if (installedRef.current) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as any).__pwaInstallEvent = promptEvent;
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      installedRef.current = true;
      setVisible(false);
    });

    const timer = setTimeout(() => {
      if (!installedRef.current && !dismissedRef.current) {
        setVisible(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setVisible(false);
      });
    } else {
      setShowFallbackTip(true);
    }
  }, [deferredPrompt]);

  if (installedRef.current || !visible) return null;

  return (
    <>
      {showFallbackTip && (
        <div className="fixed bottom-24 right-6 z-50 w-72 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-2xl animate-fadeInUp">
          <button onClick={() => setShowFallbackTip(false)} className="absolute top-2 left-2 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm text-gray-200 leading-relaxed">
            لتثبيت التطبيق، اضغط على <strong>⋮</strong> ثم <strong>"تثبيت التطبيق"</strong> من قائمة المتصفح
          </p>
        </div>
      )}
      <button
        onClick={handleInstall}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 animate-bounce"
        aria-label="تثبيت التطبيق"
      >
        <Download className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
