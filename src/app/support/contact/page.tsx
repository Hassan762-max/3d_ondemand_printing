import Link from "next/link";
import { ContactForm } from "@/components/support/contact-form";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      })
    : null;

  const orders = session?.user?.id
    ? await prisma.order.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { id: true, orderNumber: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Support</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight">
        Contact
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Send a message to the {brand.name} support team. Tickets appear in the ops queue and
        create in-app notifications — no live chat yet.
      </p>

      <ContactForm
        defaults={{
          name: user?.name ?? "",
          email: user?.email ?? "",
        }}
        orders={orders}
      />

      <div className="mt-12 space-y-4 border-t border-[var(--ink)]/10 pt-8 text-sm text-[var(--muted)]">
        <p>
          For returns on delivered orders, use{" "}
          <Link href="/orders" className="underline">
            My Orders
          </Link>{" "}
          first.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/support/help">
            <Button variant="outline">Help center</Button>
          </Link>
          <Link href="/support/returns">
            <Button variant="outline">Returns</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
