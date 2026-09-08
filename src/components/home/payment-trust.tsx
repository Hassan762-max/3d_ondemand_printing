import { brand } from "@/lib/brand";
import { formatPkr } from "@/lib/utils";

export function PaymentTrust() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="rounded-2xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-6 py-10 sm:px-10">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Payment
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
          Start your custom order with {formatPkr(brand.advanceAmount)} advance.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Pay the remaining amount through COD where available. Transparent
          ledger on every order — no surprises at the door.
        </p>
      </div>
    </section>
  );
}
