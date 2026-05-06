import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              © 2026 دراماكسيا - جميع الحقوق محفوظة
            </p>
            <p className="text-gray-400 text-sm mt-1">منصة الدراما الأولى</p>
          </div>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              سياسة الخصوصية
            </Link>
            <Link
              to="/contact"
              className="text-gray-400 hover:text-white transition text-sm"
            >
              اتصل بنا
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
