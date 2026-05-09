import { useState, useEffect, useCallback, useRef } from "react";
import { X, Download, MonitorSmartphone, Share2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches;

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as any).__pwaInstallEvent = promptEvent;
      if (!dismissedRef.current) {
        setTimeout(() => setShowBanner(true), 2000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    if (!dismissedRef.current) {
      setTimeout(() => setShowBanner(true), 4000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = useCallback(() => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === "accepted") setIsInstalled(true);
        setDeferredPrompt(null);
        setShowBanner(false);
      });
    } else {
      setShowGuide(true);
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowBanner(false);
    setShowGuide(false);
    dismissedRef.current = true;
  };

  if (isInstalled || !showBanner) return null;

  if (showGuide) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-600/20 p-2.5 rounded-xl">
              <MonitorSmartphone className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-lg font-bold">تثبيت التطبيق</h3>
            <button
              onClick={handleDismiss}
              className="mr-auto text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {isIOS() ? (
            <>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 text-rose-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>افتح قائمة المشاركة <Share2 className="w-3.5 h-3.5 inline" /></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 text-rose-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>اختر <strong>"إلى الشاشة الرئيسية"</strong> (Add to Home Screen)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 text-rose-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>اضغط <strong>"إضافة"</strong> في أعلى اليمين</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 text-rose-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>افتح قائمة المتصفح (النقاط الثلاث ⋮)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 text-rose-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>اختر <strong>"تثبيت التطبيق"</strong> أو <strong>"Install App"</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-gray-800 text-rose-400 font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>اضغط <strong>"تثبيت"</strong></span>
                </div>
              </div>
            </>
          )}
          <button
            onClick={handleDismiss}
            className="w-full mt-5 bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl transition"
          >
            حسناً
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-fadeInUp">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-3 left-3 text-gray-400 hover:text-white transition p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="bg-rose-600/20 p-3 rounded-xl shrink-0">
            <MonitorSmartphone className="w-6 h-6 text-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base mb-1">
              حمّل تطبيق سينمورا
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              حمّل التطبيق الآن واستمتع بتجربة سينمائية متكاملة على جهازك
            </p>
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-rose-600/25"
            >
              <Download className="w-4 h-4" />
              حمّل التطبيق الآن
            </button>
          </div>
        </div>

        <p className="text-gray-500 text-xs text-center mt-3">
          مجاني • سريع • بدون إعلانات مزعجة
        </p>
      </div>
    </div>
  );
}
