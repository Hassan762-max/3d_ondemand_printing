import Link from "next/link";
import { redirect } from "next/navigation";
import {
  PublishDesignForm,
  UnpublishButton,
} from "@/components/marketplace/marketplace-actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Creator hub" };

export default async function CreatorHubPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/creator");

  const designs = await prisma.design.findMany({
    where: { ownerId: session.user.id, isLibrary: false },
    include: {
      licenses: true,
      _count: { select: { licenses: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const earnings = designs.reduce(
    (sum, d) => sum + d.licenses.reduce((s, l) => s + l.amount, 0),
    0,
  );
  const sales = designs.reduce((sum, d) => sum + d.salesCount, 0);
  const live = designs.filter((d) => d.published).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
            Creators
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Creator hub
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Publish uploads to the marketplace and track licenses.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/designs/upload">
            <Button>Upload design</Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline">Browse marketplace</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Live listings" value={String(live)} />
        <Stat label="Licenses" value={String(sales)} />
        <Stat label="Earnings" value={formatPkr(earnings)} />
      </div>

      <section className="mt-12 space-y-6">
        <h2 className="text-lg font-medium tracking-tight">Your uploads</h2>
        {designs.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No uploads yet.{" "}
            <Link href="/designs/upload" className="underline">
              Upload a design
            </Link>{" "}
            to list it.
          </p>
        ) : (
          designs.map((design) => (
            <article
              key={design.id}
              className="grid gap-4 rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4 sm:grid-cols-[120px_1fr]"
            >
              <div className="aspect-square overflow-hidden rounded-lg bg-[var(--mist)] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={design.imageUrl}
                  alt={design.title}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium">{design.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      {design.moderationStatus}
                      {design.published ? " · live" : ""}
                      {" · "}
                      {design.listedPrice > 0
                        ? formatPkr(design.listedPrice)
                        : "Free"}
                      {" · "}
                      {design._count.licenses} buyers
                    </p>
                  </div>
                  {design.published ? (
                    <UnpublishButton designId={design.id} />
                  ) : null}
                </div>
                {!design.published ? (
                  <PublishDesignForm
                    designId={design.id}
                    defaultPrice={design.listedPrice}
                  />
                ) : (
                  <p className="text-sm text-[var(--muted)]">
                    Earned {formatPkr(design.licenses.reduce((s, l) => s + l.amount, 0))}{" "}
                    from this listing.
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-medium">{value}</p>
    </div>
  );
}
