import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalSection } from "@/components/portal/portal-section";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getAiProvider } from "@/lib/ai";
import { getPaymentProvider } from "@/lib/orders/payment";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin health" };

export default async function AdminHealthPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/admin/health");

  const payment = getPaymentProvider();
  const ai = getAiProvider();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--accent)]">
          System
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
          Provider health
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Live integrations used by checkout and AI tools.
        </p>
      </header>

      <PortalSection title="Integrations">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Payments
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight">
              {payment.name}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--ink)]/10 bg-[var(--paper-elevated)] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
              AI provider
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight">
              {ai.name}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/ops">
            <Button>Open Ops desk</Button>
          </Link>
          <Link href="/api/health" target="_blank">
            <Button variant="outline">Health JSON</Button>
          </Link>
        </div>
      </PortalSection>
    </div>
  );
}
