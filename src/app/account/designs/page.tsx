import Link from "next/link";
import { redirect } from "next/navigation";
import { SaveDesignButton } from "@/components/designs/save-design-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteOwnDesign } from "@/lib/actions/designs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved designs" };

export default async function SavedDesignsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const [saved, uploads] = await Promise.all([
    prisma.savedDesign.findMany({
      where: { userId: session.user.id },
      include: { design: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.design.findMany({
      where: { ownerId: session.user.id, isLibrary: false },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
            Your designs
          </h1>
        </div>
        <Link href="/designs/upload">
          <Button>Upload new</Button>
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">Saved</h2>
        {saved.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            No saved designs yet.{" "}
            <Link href="/designs" className="underline">
              Browse the library
            </Link>
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {saved.map(({ design }) => (
              <article
                key={design.id}
                className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]"
              >
                <div className="aspect-square bg-[var(--mist)] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={design.imageUrl} alt={design.title} className="h-full w-full object-contain" />
                </div>
                <div className="flex items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium">{design.title}</p>
                    <Link href={`/studio?design=${design.id}`} className="text-xs underline">
                      Open in Studio
                    </Link>
                  </div>
                  <SaveDesignButton designId={design.id} initiallySaved />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-medium tracking-tight">Uploads</h2>
        {uploads.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">You haven&apos;t uploaded any designs yet.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {uploads.map((design) => (
              <article
                key={design.id}
                className="overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)]"
              >
                <div className="aspect-square bg-[var(--mist)] p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={design.imageUrl} alt={design.title} className="h-full w-full object-contain" />
                </div>
                <div className="space-y-3 p-4">
                  <p className="font-medium">{design.title}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/studio?design=${design.id}`}>
                      <Button size="sm" variant="outline">
                        Studio
                      </Button>
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteOwnDesign(design.id);
                      }}
                    >
                      <Button type="submit" size="sm" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
