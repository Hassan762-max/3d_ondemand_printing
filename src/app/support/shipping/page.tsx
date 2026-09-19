import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { formatPkr } from "@/lib/utils";

export const metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Support</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Shipping
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        {brand.name} fulfills custom garments through Pakistan production partners. Timing depends
        on print complexity, vendor capacity, and courier lanes.
      </p>

      <div className="mt-10 space-y-6 border-t border-[var(--ink)]/10 pt-8">
        <div>
          <h2 className="font-medium tracking-tight">Coverage</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Checkout is oriented for Pakistan shipping addresses. Exact city coverage follows the
            assigned vendor&apos;s courier partners.
          </p>
        </div>
        <div>
          <h2 className="font-medium tracking-tight">Production & delivery</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            After you place an order, vendors produce and ship. Flat delivery is{" "}
            {formatPkr(brand.deliveryFee)}. Tracking appears on your order once a courier ID is
            recorded.
          </p>
        </div>
        <div>
          <h2 className="font-medium tracking-tight">COD</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            The full order total is collected on delivery. Mark COD collected in the vendor
            console when cash is received.
          </p>
        </div>
      </div>

      <div className="mt-10">
        <Link href="/support/help">
          <Button variant="outline">Back to help</Button>
        </Link>
      </div>
    </div>
  );
}
