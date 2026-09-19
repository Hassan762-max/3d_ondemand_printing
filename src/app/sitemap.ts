import type { MetadataRoute } from "next";
import { catalogProductWhere } from "@/lib/catalog/display";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");

  const products = await prisma.product.findMany({
    where: catalogProductWhere(),
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/designs",
    "/how-it-works",
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
  ];
}
