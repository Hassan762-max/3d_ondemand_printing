import Link from "next/link";
import { CartItems } from "@/components/cart/cart-items";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cart" };

export default async function CartPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Cart</h1>
        <div className="mt-12 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">Sign in to view and manage your cart.</p>
          <Link href="/auth/sign-in?callbackUrl=/cart" className="mt-6 inline-block">
            <Button>Sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true, slug: true } },
          design: { select: { title: true, imageUrl: true } },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  const items = cart?.items ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Cart</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {items.length} item{items.length === 1 ? "" : "s"} · Rs. 500 advance + remaining COD
      </p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
          <p className="text-sm text-[var(--muted)]">
            Your cart is empty. Add a product with an optional design.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/products">
              <Button>Browse products</Button>
            </Link>
            <Link href="/designs">
              <Button variant="outline">Browse designs</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <CartItems items={items} />
        </div>
      )}
    </div>
  );
}
