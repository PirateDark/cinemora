// src/services/proxyApi.ts
// نظام ذكي ومباشر لتوفير روابط فيديو (يعمل من متصفح المستخدم)

// قائمة المصادر مرتبة حسب الأولوية (سيتم تجربتها بالترتيب)
const SOURCES = {
  movie: (id: string) => [
    `https://vidsrc.pro/embed/movie/${id}`,
    `https://2embed.to/embed/tmdb/movie?id=${id}`,
    `https://embed.su/embed/movie/${id}`,
    `https://multiembed.ru/movie/${id}`,
    `https://vidbinge.com/embed/movie/${id}`,
  ],
  tv: (id: string, season?: number, episode?: number) => [
    `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`,
    `https://2embed.to/embed/tmdb/tv?id=${id}&s=${season}&e=${episode}`,
    `https://embed.su/embed/tv/${id}/${season}/${episode}`,
    `https://multiembed.ru/tv/${id}/${season}/${episode}`,
    `https://vidbinge.com/embed/tv/${id}/${season}/${episode}`,
  ],
};

/**
 * يجرب المصادر بالترتيب ويعيد أول رابط يعمل.
 * يتم هذا الاختبار في متصفح المستخدم وليس على الخادم، مما يتجاوز مشكلة الحظر.
 */
export const getVideoSource = async (
  type: "movie" | "tv",
  id: string,
  season?: number,
  episode?: number,
): Promise<string | null> => {
  const sourceList =
    type === "movie" ? SOURCES.movie(id) : SOURCES.tv(id, season, episode);

  console.log(
    `🔍 جاري تجربة ${sourceList.length} مصدراً للعنصر ${type} ${id}...`,
  );

  for (const url of sourceList) {
    try {
      // اختبار سريع للرابط: نرسل طلب HEAD لنتأكد من أنه قابل للفتح
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(url, {
        method: "HEAD",
        mode: "no-cors", // نتجاوز قيود CORS، المهم هو أن الرابط يعمل عند وضعه في iframe
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log(`✅ تم العثور على مصدر يعمل: ${url}`);
      return url;
    } catch (err) {
      console.log(`❌ المصدر لا يعمل: ${url}`);
    }
  }

  // في أسوأ الأحوال، نعيد أول مصدر كحل احتياطي
  console.warn(
    `⚠️ لم يتم العثور على مصدر يعمل، سيتم استخدام أول مصدر كحل احتياطي.`,
  );
  return sourceList[0] || null;
};

/**
 * يجيب جميع المصادر المتاحة (يمكن استخدامها لعرض قائمة يدوية للمستخدم)
 */
export const getAllVideoSources = async (
  type: "movie" | "tv",
  id: string,
  season?: number,
  episode?: number,
): Promise<string[]> => {
  return type === "movie" ? SOURCES.movie(id) : SOURCES.tv(id, season, episode);
};
