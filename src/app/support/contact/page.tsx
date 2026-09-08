import Link from "next/link";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Support</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Contact
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Reach {brand.name} for order help, vendor questions, or product feedback. Live chat and
        ticket inbox are not wired yet — use these channels for now.
      </p>

      <div className="mt-10 space-y-6 border-t border-[var(--ink)]/10 pt-8">
        <div>
          <h2 className="font-medium tracking-tight">Orders & returns</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Sign in and open{" "}
            <Link href="/orders" className="underline">
              My Orders
            </Link>{" "}
            for status, tracking, and return requests. Ops reviews returns from the console.
          </p>
        </div>
        <div>
          <h2 className="font-medium tracking-tight">Email</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            support@{brand.name.toLowerCase()}.pk — replace with your production inbox when live.
          </p>
        </div>
        <div>
          <h2 className="font-medium tracking-tight">Account</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Demo logins use @printora.pk emails; the product brand is {brand.name}.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/support/help">
          <Button variant="outline">Help center</Button>
        </Link>
        <Link href="/support/returns">
          <Button variant="outline">Returns</Button>
        </Link>
      </div>
    </div>
  );
}
