import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Cart</h1>
      <div className="mt-12 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
        <p className="text-sm text-[var(--muted)]">
          Your cart is empty. Customize a product to add your first piece.
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
      <p className="mt-8 text-xs text-[var(--muted)]">
        Checkout uses Rs. 500 advance + remaining amount on COD. Full cart wiring lands in Phase 6.
      </p>
    </div>
  );
}
