import Link from "next/link";
import { LicenseDesignButton } from "@/components/marketplace/marketplace-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketplace" };

export default async function MarketplacePage() {
  const session = await auth();
  const listings = await prisma.design.findMany({
    where: { published: true, moderationStatus: "approved" },
    include: {
      owner: { select: { name: true, role: true } },
      _count: { select: { licenses: true } },
    },
    orderBy: [{ salesCount: "desc" }, { createdAt: "desc" }],
  });

  const licensedIds = new Set(
    session?.user?.id
      ? (
          await prisma.designLicense.findMany({
            where: { buyerId: session.user.id },
            select: { designId: true },
          })
        ).map((l) => l.designId)
      : [],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Creator marketplace
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Designs from Pakistan creators
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            License community artwork for your {brand.name} orders. Free and paid listings —
            designers earn when you add their work.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/creator">
            <Button>Creator hub</Button>
          </Link>
          <Link href="/designs">
            <Button variant="outline">Official library</Button>
          </Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">
            No marketplace listings yet. Upload a design and publish it from Creator hub.
          </p>
          <Link href="/creator" className="mt-6 inline-block">
            <Button>Open creator hub</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((design) => {
            const tags = JSON.parse(design.tags || "[]") as string[];
            const owned = design.ownerId === session?.user?.id;
            return (
              <article
                key={design.id}
                className="overflow-hidden rounded-xl border border-[var(--ink)]/8 bg-[var(--paper-elevated)]"
              >
                <Link href={`/marketplace/${design.id}`} className="block">
                  <div className="aspect-square bg-[var(--mist)] p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </Link>
                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                      {design.owner?.name ?? "Creator"}
                      {design.listedPrice > 0
                        ? ` · ${formatPkr(design.listedPrice)}`
                        : " · Free"}
                    </p>
                    <h2 className="mt-1 font-medium tracking-tight">{design.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                      {design.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-[var(--mist)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    {design.salesCount} licenses · {design._count.licenses} buyers
                  </p>
                  {owned ? (
                    <p className="text-sm text-[var(--muted)]">Your listing</p>
                  ) : (
                    <LicenseDesignButton
                      designId={design.id}
                      price={design.listedPrice}
                      alreadyLicensed={licensedIds.has(design.id)}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
