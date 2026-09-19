import { PrismaClient } from "@prisma/client";
import { computeOrderTotals, generateOrderNumber } from "../src/lib/orders/pricing";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "customer@printora.pk" },
  });
  const product = await prisma.product.findFirst({
    where: { slug: "essential-tee" },
    include: { variants: true },
  });
  if (!user || !product) throw new Error("missing seed");

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product.id,
      size: product.variants[0].size,
      color: product.variants[0].color,
      quantity: 1,
      unitPrice: product.basePrice,
    },
  });

  const totals = computeOrderTotals(product.basePrice, "Lahore");
  const orderNumber = generateOrderNumber();

  console.log({
    ok: totals.advanceAmount === 0 && totals.remainingAmount === totals.totalPayable,
    orderNumber,
    productBase: product.basePrice,
    totals,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
