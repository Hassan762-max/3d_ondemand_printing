import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export const metadata = { title: "Returns" };

export default function ReturnsSupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Support</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Returns
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Custom printed apparel is made for you. {brand.name} accepts return requests for defects and
        fulfillment problems — not style change-of-mind after production.
      </p>

      <div className="mt-10 space-y-6 border-t border-[var(--ink)]/10 pt-8">
        <div>
          <h2 className="font-medium tracking-tight">How to request</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Open{" "}
            <Link href="/orders" className="underline">
              My Orders
            </Link>
            , choose the order, and submit a return with photos when asked. Ops reviews QC and may
            approve refunds against eligible completed COD ledger rows.
          </p>
        </div>
        <div>
          <h2 className="font-medium tracking-tight">What qualifies</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Print defects, wrong size if caused by fulfillment error, damaged delivery, or missing
            items. Reasons available in the form depend on order status.
          </p>
        </div>
        <div>
          <h2 className="font-medium tracking-tight">Refunds</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Approved refunds follow collected COD amounts. Unpaid COD balances are not refunded as
            cash.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/orders">
          <Button>My orders</Button>
        </Link>
        <Link href="/support/contact">
          <Button variant="outline">Contact</Button>
        </Link>
      </div>
    </div>
  );
}
