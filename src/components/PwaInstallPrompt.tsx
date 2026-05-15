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
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (installedRef.current) {
      console.log("📱 PWA: Already installed (standalone mode)");
      return;
    }

    console.log("📱 PWA: Checking browser support...");

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      deferredRef.current = promptEvent;
      (window as any).__pwaInstallEvent = promptEvent;
      console.log("📱 PWA: beforeinstallprompt event captured — browser supports install");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      installedRef.current = true;
      setVisible(false);
      console.log("📱 PWA: App installed successfully");
    });

    const showTimer = setTimeout(() => {
      if (!installedRef.current && !dismissedRef.current) {
        if (deferredRef.current) {
          console.log("📱 PWA: Showing install button (event available)");
        } else {
          console.log("📱 PWA: No beforeinstallprompt event — showing fallback button");
        }
        setVisible(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(showTimer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const autoHide = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(autoHide);
  }, [visible]);

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
        className="fixed bottom-6 right-6 z-50 rounded-full bg-rose-600 hover:bg-rose-500 shadow-xl shadow-rose-600/40 flex items-center gap-2 px-4 py-2.5 transition-all hover:scale-105 active:scale-95 animate-bounce"
        aria-label="تثبيت التطبيق"
      >
        <Download className="w-5 h-5 text-white shrink-0" />
        <span className="text-white font-bold text-sm whitespace-nowrap">حمل التطبيق الآن</span>
      </button>
    </>
  );
}
