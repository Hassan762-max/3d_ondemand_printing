import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/products/add-to-cart-form";
import { WishlistButton } from "@/components/products/wishlist-button";
import { auth } from "@/lib/auth";
import {
  catalogCategoryTag,
  catalogDisplayName,
  catalogImageUrl,
  isHiddenCatalogSlug,
} from "@/lib/catalog/display";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

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

  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [
    ...new Map(
      product.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }]),
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
        select: { id: true, title: true },
        take: 50,
      })
    : await prisma.design.findMany({
        where: { isLibrary: true },
        orderBy: { title: "asc" },
        select: { id: true, title: true },
        take: 50,
      });

  const styleProfile = session?.user?.id
    ? await prisma.styleProfile.findUnique({ where: { userId: session.user.id } })
    : null;
  let defaultSize: string | undefined;
  if (styleProfile) {
    try {
      const sizesJson = JSON.parse(styleProfile.sizes || "{}") as { default?: string };
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
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
      <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#efece6] ring-1 ring-[var(--ink)]/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={displayName}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {catalogCategoryTag(product.category)} · Starts at {formatPkr(product.basePrice)}
          {avgRating
            ? ` · ${avgRating.toFixed(1)}/5 (${productReviews.length})`
            : ""}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {displayName}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          {product.description}
        </p>

        <div className="mt-8">
          <AddToCartForm
            productId={product.id}
            sizes={sizes}
            colors={colors}
            designs={designs}
            initialDesignId={designParam}
            initialSize={defaultSize}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <WishlistButton productId={product.id} initiallySaved={wishlisted} />
        </div>

        {productReviews.length > 0 ? (
          <section className="mt-12 border-t border-[var(--ink)]/8 pt-8">
            <h2 className="text-lg font-medium tracking-tight">Customer reviews</h2>
            <ul className="mt-4 space-y-4">
              {productReviews.map((review) => (
                <li key={review.id} className="text-sm">
                  <p className="font-medium">
                    {review.rating}/5 · {review.user.name ?? "Customer"}
                  </p>
                  {review.body ? (
                    <p className="mt-1 text-[var(--muted)]">{review.body}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
