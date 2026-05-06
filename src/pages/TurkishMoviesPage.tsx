import { Link } from "react-router-dom";
import { Film } from "lucide-react";

export default function TurkishMoviesPage() {
  return (
    <div className="text-center py-20">
      <Film className="w-16 h-16 text-rose-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">أفلام تركية</h1>
      <p className="text-gray-400">
        قريباً - سيتم إضافة الأفلام التركية قريباً
      </p>
      <Link to="/" className="text-rose-500 hover:underline mt-4 inline-block">
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}
