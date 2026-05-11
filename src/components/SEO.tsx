import { Helmet } from "react-helmet-async";

const BASE = "سينمورا";
const BASE_URL = "https://cinemora-theta.vercel.app";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "video.movie" | "video.tv_show";
}

export default function SEO({ title, description, keywords, image, url, type = "website" }: SEOProps) {
  const fullTitle = title.startsWith(BASE) ? title : `${BASE} | ${title}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || `شاهد ${title} على ${BASE} - أفضل منصة للمشاهدة العربية والعالمية`} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || `شاهد ${title} على ${BASE}`} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url || BASE_URL} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={BASE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || `شاهد ${title} على ${BASE}`} />
      {image && <meta name="twitter:image" content={image} />}
      <link rel="canonical" href={url || BASE_URL} />
    </Helmet>
  );
}
