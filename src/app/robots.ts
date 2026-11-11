import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/admin/", "/auth/", "/go/"] }, sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://gobuildabiz.com"}/sitemap.xml` }; }
