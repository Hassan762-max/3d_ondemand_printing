import { notFound } from "next/navigation";
import { ProductConfigurator } from "@/components/products/product-configurator";
import { auth } from "@/lib/auth";
import {
  catalogBackImageUrl,
  catalogCategoryTag,
  catalogColorOption,
  catalogDisplayName,
  catalogImageUrl,
  catalogPrintZones,
  catalogProductSpecs,
  isHiddenCatalogSlug,
} from "@/lib/catalog/display";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ design?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (isHiddenCatalogSlug(slug)) return { title: "Product" };
  const product = await prisma.product.findUnique({ where: { slug } });
  return {
    title: product
      ? catalogDisplayName(product.slug, product.name)
      : "Product",
  };
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { design: designParam } = await searchParams;
  const session = await auth();
  if (isHiddenCatalogSlug(slug)) notFound();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });
  if (!product || !product.active) notFound();

  const displayName = catalogDisplayName(product.slug, product.name);
  const imageUrl = catalogImageUrl(product.slug, product.imageUrl);
  const imageBackUrl = catalogBackImageUrl(product.slug, product.imageUrl);
  const specs = catalogProductSpecs(product.slug, product.category);
  const printZones = catalogPrintZones(product.slug);

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [
    ...new Map(
      product.variants.map((v) => {
        const option = catalogColorOption(v.color, v.colorHex);
        return [option.name, option];
      }),
    ).values(),
  ];

  const wishlisted = session?.user?.id
    ? Boolean(
        await prisma.wishlistItem.findUnique({
          where: {
            userId_productId: { userId: session.user.id, productId: product.id },
          },
        }),
      )
    : false;

  const designSelect = {
    id: true,
    title: true,
    imageUrl: true,
  } as const;

  const designs = session?.user?.id
    ? await prisma.design.findMany({
        where: {
          OR: [
            { isLibrary: true },
            { ownerId: session.user.id },
            {
              published: true,
              moderationStatus: "approved",
              licenses: { some: { buyerId: session.user.id } },
            },
          ],
        },
        orderBy: { title: "asc" },
        select: designSelect,
        take: 50,
      })
    : await prisma.design.findMany({
        where: { isLibrary: true },
        orderBy: { title: "asc" },
        select: designSelect,
        take: 50,
      });

  const styleProfile = session?.user?.id
    ? await prisma.styleProfile.findUnique({ where: { userId: session.user.id } })
    : null;
  let defaultSize: string | undefined;
  if (styleProfile) {
    try {
      const sizesJson = JSON.parse(styleProfile.sizes || "{}") as {
        default?: string;
      };
      defaultSize = sizesJson.default;
    } catch {
      defaultSize = undefined;
    }
  }

  const productReviews = await prisma.review.findMany({
    where: {
      order: {
        items: { some: { productId: product.id } },
        status: "DELIVERED",
      },
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const avgRating =
    productReviews.length > 0
      ? productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length
      : null;

  return (
    <ProductConfigurator
      productId={product.id}
      displayName={displayName}
      categoryTag={catalogCategoryTag(product.category)}
      description={product.description}
      basePrice={product.basePrice}
      imageUrl={imageUrl}
      imageBackUrl={imageBackUrl}
      sizes={sizes}
      colors={colors}
      designs={designs}
      initialDesignId={designParam}
      initialSize={defaultSize}
      printZones={printZones}
      specs={specs}
      wishlisted={wishlisted}
      avgRating={avgRating}
      showSideToggle={product.category !== "CAP"}
      reviews={productReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        body: r.body,
        userName: r.user.name,
      }))}
    />
  );
}
