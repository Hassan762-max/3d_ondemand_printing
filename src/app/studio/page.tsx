import { StudioShell } from "@/components/studio/studio-shell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "3D Studio" };

type Props = {
  searchParams: Promise<{ product?: string; design?: string }>;
};

export default async function StudioPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await auth();

  const productsRaw = await prisma.product.findMany({
    where: { active: true },
    include: { variants: true },
    orderBy: { name: "asc" },
  });

  const products = productsRaw.map((p) => {
    const sizes = [...new Set(p.variants.map((v) => v.size))];
    const colors = [
      ...new Map(
        p.variants.map((v) => [v.color, { name: v.color, hex: v.colorHex }]),
      ).values(),
    ];
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      basePrice: p.basePrice,
      imageUrl: p.imageUrl,
      sizes,
      colors,
    };
  });

  const designs = await prisma.design.findMany({
    where: {
      OR: [
        { isLibrary: true },
        ...(session?.user?.id ? [{ ownerId: session.user.id }] : []),
      ],
    },
    orderBy: [{ isLibrary: "desc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      isLibrary: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
        3D Clothing Studio
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
        Customize in real time
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Apply artwork, move and scale it, switch garment color and print side,
        orbit 360°, save looks to compare, then add to cart.
      </p>

      <div className="mt-10">
        <StudioShell
          products={products}
          designs={designs}
          initialProductSlug={params.product ?? null}
          initialDesignId={params.design ?? null}
        />
      </div>
    </div>
  );
}
