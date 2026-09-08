import Link from "next/link";
import { notFound } from "next/navigation";
import { LicenseDesignButton } from "@/components/marketplace/marketplace-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const design = await prisma.design.findUnique({ where: { id } });
  return { title: design?.title ?? "Marketplace design" };
}

export default async function MarketplaceDetailPage({ params }: Props) {
  const session = await auth();
  const { id } = await params;
  const design = await prisma.design.findFirst({
    where: { id, published: true, moderationStatus: "approved" },
    include: { owner: { select: { name: true, city: true, role: true } } },
  });
  if (!design) notFound();

  const licensed = session?.user?.id
    ? Boolean(
        await prisma.designLicense.findUnique({
          where: {
            designId_buyerId: { designId: design.id, buyerId: session.user.id },
          },
        }),
      )
    : false;

  const owned = design.ownerId === session?.user?.id;
  const tags = JSON.parse(design.tags || "[]") as string[];

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-2xl bg-[var(--mist)] p-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={design.imageUrl}
          alt={design.title}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          {design.owner?.name ?? "Creator"}
          {design.owner?.city ? ` · ${design.owner.city}` : ""}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
          {design.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          {design.description || `Community marketplace design for ${brand.name} printing.`}
        </p>
        <p className="mt-6 text-2xl font-medium">
          {design.listedPrice > 0 ? formatPkr(design.listedPrice) : "Free"}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {design.salesCount} licenses · print-ready for Studio & cart
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-[var(--mist)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-8 space-y-4">
          {owned ? (
            <p className="text-sm text-[var(--muted)]">This is your listing.</p>
          ) : session?.user ? (
            <LicenseDesignButton
              designId={design.id}
              price={design.listedPrice}
              alreadyLicensed={licensed}
            />
          ) : (
            <Link href={`/auth/sign-in?callbackUrl=/marketplace/${design.id}`}>
              <Button>Sign in to license</Button>
            </Link>
          )}
          {(owned || licensed) && (
            <div className="flex flex-wrap gap-3">
              <Link href={`/studio?design=${design.id}`}>
                <Button variant="outline">Open in Studio</Button>
              </Link>
              <Link href={`/products?design=${design.id}`}>
                <Button variant="ghost">Apply to product</Button>
              </Link>
            </div>
          )}
        </div>
        <Link href="/marketplace" className="mt-10 text-sm underline">
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}
