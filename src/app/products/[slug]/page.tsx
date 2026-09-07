import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/products/add-to-cart-form";
import { WishlistButton } from "@/components/products/wishlist-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });
  if (!product) notFound();

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
          OR: [{ isLibrary: true }, { ownerId: session.user.id }],
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

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--mist)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl ?? "/products/tee.svg"}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          From {formatPkr(product.basePrice)}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {product.name}
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
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <WishlistButton productId={product.id} initiallySaved={wishlisted} />
          <Link href={`/studio?product=${product.slug}`}>
            <Button size="lg" variant="outline">
              Customize in 3D
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
