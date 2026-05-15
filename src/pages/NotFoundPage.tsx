import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import SEO from "../components/SEO";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <SEO title="404 - الصفحة غير موجودة" description="عذراً، الصفحة التي تبحث عنها غير موجودة" />
      <h1 className="text-8xl font-extrabold text-rose-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-2">الصفحة غير موجودة</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        يبدو أن هذه الصفحة لا وجود لها أو تم حذفها. ارجع للرئيسية وابحث عن ما
        تريد.
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold transition"
        >
          <Home className="w-5 h-5" />
          الرئيسية
        </Link>
        <Link
          to="/search"
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition"
        >
          <Search className="w-5 h-5" />
          بحث
        </Link>
      </div>
    </div>
  );
}
