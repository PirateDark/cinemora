import { useState, useEffect } from "react";
import { Heart, X } from "lucide-react";

const LS_KEY = "cinemora_announcement_closed";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const closed = localStorage.getItem(LS_KEY) === "true";
    if (!closed) {
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(LS_KEY, "true");
  };

  if (!visible) return null;

  return (
    <div
      className="relative w-full max-w-4xl mx-auto mb-8 animate-fadeIn"
      dir="rtl"
    >
      <div className="relative bg-gradient-to-br from-[#0f0f0f] via-[#1a0f0f] to-[#0f0f0f] rounded-2xl border border-rose-500/20 shadow-xl shadow-rose-500/5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-l from-rose-600 via-rose-400 to-purple-600" />

        <button
          onClick={handleClose}
          className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 text-gray-400 hover:text-white transition-all"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/10 border border-rose-500/20 rounded-full">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span className="text-rose-400 text-xs font-bold tracking-wide">
                إعلان هام
              </span>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight">
            السلام عليكم ورحمة الله وبركاته،
          </h2>

          <div className="space-y-3 text-gray-300 leading-relaxed text-sm md:text-base">
            <p>
              بعد تفكير طويل ومراجعة للنفس، قررت إيقاف المواقع الخاصة بعرض الأفلام
              والمسلسلات بشكل نهائي.
            </p>
            <p>
              هذا القرار لم يكن سهلًا، لكنه نابع من قناعة شخصية ورغبة صادقة في الابتعاد
              عما لا أراه مناسبًا لي أمام الله سبحانه وتعالى، وأسأل الله أن يوفقني
              لما فيه الخير.
            </p>
            <p>
              أتقدم بالشكر لكل من دعم الموقع وسانده خلال الفترة الماضية، وأعتذر عن أي
              إزعاج قد يسببه هذا القرار.
            </p>
            <p>
              كما أرجو من جميع زوار الموقع الكرام الدعاء لصديقتنا ليال بالتوفيق والنجاح
              في امتحاناتها، وأن يرزقها الله التيسير والتفوق ويحقق لها ما تتمنى. 🤍
            </p>
            <p>
              نسأل الله لنا ولكم التوفيق والسداد، وأن يبارك في أعمارنا وأعمالنا، وأن
              يجعل القادم خيرًا للجميع.
            </p>
            <p>لا تنسونا ولا تنسوا ليال من صالح دعائكم.</p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-rose-400/80 text-sm font-medium">
              🤍 إدارة الموقع Ryuu
            </p>
            <p className="text-gray-400 text-xs text-center md:text-left leading-relaxed">
              🤍 دعوة صادقة من إدارة الموقع: نرجو منكم الدعاء لصديقتنا ليال بالتوفيق
              والنجاح في امتحاناتها، وأن ييسر الله لها كل خير. 🤲📚✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
