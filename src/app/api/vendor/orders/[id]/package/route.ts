import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildPrintPackage } from "@/lib/fulfillment/print-package";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const vendor = await prisma.vendor.findUnique({
    where: { userId: session.user.id },
  });

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  const order = await prisma.order.findFirst({
    where: {
      id,
      ...(vendor && !isAdmin ? { vendorId: vendor.id } : {}),
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, category: true } },
          design: { select: { title: true, imageUrl: true } },
        },
      },
      vendor: { select: { businessName: true, city: true, phone: true } },
      shipments: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!vendor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pkg = buildPrintPackage(order);
  return new NextResponse(JSON.stringify(pkg, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${order.orderNumber}-print-package.json"`,
    },
  });
}
