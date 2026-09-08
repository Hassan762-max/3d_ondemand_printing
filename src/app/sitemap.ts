import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");

  const [products, marketplace] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.design.findMany({
      where: { published: true, moderationStatus: "approved" },
      select: { id: true, updatedAt: true },
      take: 200,
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/designs",
    "/marketplace",
    "/how-it-works",
    "/studio",
    "/ai",
    "/try-on",
    "/support/help",
    "/support/contact",
    "/support/shipping",
    "/support/returns",
    "/legal/privacy",
    "/legal/terms",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...marketplace.map((d) => ({
      url: `${base}/marketplace/${d.id}`,
      lastModified: d.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
