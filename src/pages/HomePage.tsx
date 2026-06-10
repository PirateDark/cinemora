import { useRef } from "react";
import SEO from "../components/SEO";

export default function HomePage() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => {
      const h2c = (window as any).html2canvas;
      h2c(cardRef.current!, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        allowTaint: false,
      }).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement("a");
        link.download = "cinemora-announcement.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    };
    document.body.appendChild(script);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 md:p-8" dir="rtl">
      <SEO title="سينمورا - إعلان هام" />

      <div
        ref={cardRef}
        className="relative w-full max-w-2xl bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] rounded-3xl border border-rose-500/20 shadow-2xl shadow-rose-500/10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-l from-rose-600 via-rose-400 to-purple-600" />

        <div className="pt-10 pb-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-l from-rose-500 via-rose-400 to-purple-500 bg-clip-text text-transparent">
              Cinemora
            </span>
          </h1>
          <p className="text-gray-600 text-xs mt-1 tracking-widest uppercase">cinemoratv.online</p>
        </div>

        <div className="px-8 md:px-12 py-6 space-y-5">
          <div className="text-center">
            <div className="inline-block px-4 py-1.5 bg-rose-600/10 border border-rose-500/30 rounded-full text-rose-400 text-xs font-bold tracking-wide mb-4">
              إعلان هام
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              السلام عليكم ورحمة الله وبركاته
            </h2>
          </div>

          <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base">
            <p>
              بعد تفكير طويل ومراجعة للنفس، قررت إيقاف تشغيل موقع سينمورا بشكل نهائي.
            </p>
            <p>
              هذا القرار لم يكن سهلاً، لكنه نابع من قناعة شخصية ورغبة صادقة في الابتعاد
              عما لا أراه مناسبًا لي أمام الله سبحانه وتعالى، فالدنيا زائلة، وما يبقى
              للإنسان هو عمله.
            </p>
            <p>
              أشكر كل من دعم الموقع وساندنا خلال الفترة الماضية، وأعتذر عن أي إزعاج
              قد يسببه هذا القرار لبعض المتابعين.
            </p>
            <p>
              أسأل الله أن يوفقنا جميعًا لما يحب ويرضى، وأن يرزقنا وإياكم الخير والبركة
              في أرزاقنا وأعمالنا، وأن يجعل ما نقوم به خالصًا لوجهه الكريم.
            </p>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-sm text-center">
              🤍 أرجو منكم الدعاء لصديقتنا <strong className="text-rose-400">ليال</strong> بالتوفيق في الامتحانات
            </p>
          </div>

          <p className="text-center text-gray-600 text-xs">
            والسلام عليكم ورحمة الله وبركاته
          </p>
        </div>

        <div className="h-1 bg-gradient-to-r from-rose-600 via-rose-400 to-purple-600" />
      </div>

      <button
        onClick={handleDownload}
        className="mt-6 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30"
      >
        📥 تحميل الصورة
      </button>
      <p className="text-gray-600 text-xs mt-2">أو استخدم Screenshot لحفظ البوستر</p>
    </div>
  );
}
