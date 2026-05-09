import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";

export default function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js");

      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShow(true);
      }

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setShow(true);
            }
          });
        }
      });
    };

    registerSW();
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-fadeInUp">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="bg-blue-600/20 p-2 rounded-xl shrink-0">
            <RefreshCw className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm mb-1">
              تحديث متاح
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              يوجد إصدار جديد من التطبيق. حمّله الآن للحصول على أحدث الميزات.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                تحديث الآن
              </button>
              <button
                onClick={() => setShow(false)}
                className="text-gray-400 hover:text-white text-xs px-3 py-1.5 transition"
              >
                لاحقاً
              </button>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-white transition p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
