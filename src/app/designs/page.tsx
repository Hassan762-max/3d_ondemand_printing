import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SaveDesignButton } from "@/components/designs/save-design-button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design library" };

export default async function DesignsPage() {
  const session = await auth();
  const designs = await prisma.design.findMany({
    where: {
      OR: [
        { isLibrary: true },
        ...(session?.user?.id ? [{ ownerId: session.user.id }] : []),
      ],
    },
    orderBy: [{ isLibrary: "desc" }, { createdAt: "desc" }],
  });

  const savedIds = new Set(
    session?.user?.id
      ? (
          await prisma.savedDesign.findMany({
            where: { userId: session.user.id },
            select: { designId: true },
          })
        ).map((s) => s.designId)
      : [],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Ready-made & yours
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Design library
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            Browse curated prints or upload your own. Save favorites and apply them to any product.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/designs/upload">
            <Button>Upload design</Button>
          </Link>
          <Link href="/account/designs">
            <Button variant="outline">Saved designs</Button>
          </Link>
        </div>
      </div>

      {designs.length === 0 ? (
        <div className="mt-16 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">No designs yet. Upload one to get started.</p>
          <Link href="/designs/upload" className="mt-6 inline-block">
            <Button>Upload design</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {designs.map((design) => {
            const tags = JSON.parse(design.tags || "[]") as string[];
            return (
              <article
                key={design.id}
                className="group overflow-hidden rounded-xl border border-[var(--ink)]/8 bg-[var(--paper-elevated)] transition hover:border-[var(--ink)]/20"
              >
                <Link href={`/studio?design=${design.id}`} className="block">
                  <div className="aspect-square bg-[var(--mist)] p-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={design.imageUrl}
                      alt={design.title}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                        {design.isLibrary ? "Library" : "Your upload"}
                      </p>
                      <h2 className="mt-1 font-medium tracking-tight">{design.title}</h2>
                    </div>
                    <SaveDesignButton
                      designId={design.id}
                      initiallySaved={savedIds.has(design.id)}
                    />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                    {design.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-[var(--mist)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/studio?design=${design.id}`} className="text-sm underline">
                      Use in Studio
                    </Link>
                    <Link
                      href={`/products?design=${design.id}`}
                      className="text-sm text-[var(--muted)] underline"
                    >
                      Apply to product
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
