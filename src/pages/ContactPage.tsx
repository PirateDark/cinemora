import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { useToast } from "../components/Toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // تخزين الرسالة محلياً إلى أن يتوفر backend
    await new Promise((resolve) => setTimeout(resolve, 600));
    const messages = JSON.parse(localStorage.getItem("contact_messages") || "[]");
    messages.push({ ...formData, timestamp: new Date().toISOString() });
    localStorage.setItem("contact_messages", JSON.stringify(messages));
    setIsSubmitted(true);
    setIsLoading(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
    toast("تم إرسال رسالتك بنجاح!");
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2 text-center">اتصل بنا</h1>
      <p className="text-gray-400 text-center mb-8">
        نحن هنا للإجابة على استفساراتك واقتراحاتك
      </p>

      {/* نموذج الاتصال فقط */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          أرسل لنا رسالة
        </h2>

        {isSubmitted ? (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-400 font-semibold">
              تم إرسال رسالتك بنجاح!
            </p>
            <p className="text-gray-300 text-sm mt-1">سنتواصل معك قريباً</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                الاسم الكامل *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="example@domain.com"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">
                الموضوع *
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">اختر الموضوع</option>
                <option value="استفسار عام">استفسار عام</option>
                <option value="مشكلة تقنية">مشكلة تقنية</option>
                <option value="اقتراح">اقتراح</option>
                <option value="شكوى">شكوى</option>
                <option value="تعاون">طلب تعاون</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">
                الرسالة *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                "جاري الإرسال..."
              ) : (
                <>
                  <Send className="w-4 h-4" /> إرسال الرسالة
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
