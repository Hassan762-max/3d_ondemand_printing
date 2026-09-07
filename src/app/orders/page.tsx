import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl tracking-tight">Orders</h1>
      <div className="mt-12 rounded-xl border border-dashed border-[var(--ink)]/15 px-6 py-16 text-center">
        <p className="text-sm text-[var(--muted)]">No orders yet.</p>
        <Link href="/products" className="mt-6 inline-block">
          <Button>Start an order</Button>
        </Link>
      </div>
    </div>
  );
}
