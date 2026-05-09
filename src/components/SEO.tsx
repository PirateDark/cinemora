import { Helmet } from "react-helmet-async";

const BASE = "سينمورا";

export default function SEO({ title }: { title: string }) {
  return (
    <Helmet>
      <title>{title.startsWith(BASE) ? title : `${BASE} | ${title}`}</title>
    </Helmet>
  );
}
