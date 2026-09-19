import Link from "next/link";
import { redirect } from "next/navigation";
import { WishlistButton } from "@/components/products/wishlist-button";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Account</p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
        Wishlist
      </h1>

      {items.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">No saved products yet.</p>
          <Link href="/products" className="mt-6 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ product }) => (
            <article key={product.id} className="group">
              <Link href={`/products/${product.slug}`}>
                <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[var(--mist)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl ?? "/products/tee.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </Link>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium tracking-tight">{product.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{formatPkr(product.basePrice)}</p>
                </div>
                <WishlistButton productId={product.id} initiallySaved />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
