import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account/",
        "/admin",
        "/ops",
        "/vendor",
        "/cart",
        "/checkout",
        "/api/",
        "/auth/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
