import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
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
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Sizes</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <span
                key={size}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-[var(--ink)]/12 px-3 text-sm"
              >
                {size}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">Colors</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {colors.map((color) => (
              <span key={color.name} className="flex items-center gap-2 text-sm">
                <span
                  className="h-5 w-5 rounded-full border border-[var(--ink)]/15"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={`/studio?product=${product.slug}`}>
            <Button size="lg">Customize in 3D</Button>
          </Link>
          <Link href="/designs">
            <Button size="lg" variant="outline">
              Choose a design
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
