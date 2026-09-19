import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.user.findUnique({
    where: { email: "customer@printora.pk" },
    select: { id: true, name: true, city: true },
  });
  console.log("CUSTOMER", customer);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: { select: { email: true, name: true } },
      vendor: {
        select: {
          businessName: true,
          city: true,
          user: { select: { email: true } },
        },
      },
      items: {
        select: {
          quantity: true,
          product: { select: { name: true, slug: true, category: true } },
        },
      },
    },
  });

  console.log("ALL_ORDERS", orders.length);
  for (const o of orders) {
    console.log({
      id: o.id,
      number: o.orderNumber,
      status: o.status,
      shippingCity: o.shippingCity,
      customer: o.user.email,
      vendor: o.vendor
        ? `${o.vendor.businessName} <${o.vendor.user.email}>`
        : "UNASSIGNED",
      items: o.items.map(
        (i) => `${i.quantity}x ${i.product.slug} (${i.product.category})`,
      ),
      createdAt: o.createdAt.toISOString(),
    });
  }

  const lhe = await prisma.vendor.findFirst({
    where: { user: { email: "vendor.lhe@printora.pk" } },
    select: { id: true, businessName: true, city: true, active: true, approvalStatus: true },
  });
  console.log("LAHORE_VENDOR", lhe);
  if (lhe) {
    const count = await prisma.order.count({ where: { vendorId: lhe.id } });
    console.log("LAHORE_VENDOR_ORDER_COUNT", count);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
