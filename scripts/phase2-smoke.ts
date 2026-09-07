import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "customer@printora.pk" },
  });
  const product = await prisma.product.findFirst({
    where: { slug: "essential-tee" },
    include: { variants: true },
  });
  const design = await prisma.design.findFirst({ where: { isLibrary: true } });
  if (!user || !product || !design) throw new Error("missing seed data");

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
      designId: design.id,
      size: product.variants[0].size,
      color: product.variants[0].color,
      quantity: 2,
      unitPrice: product.basePrice,
    },
  });

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: user.id, productId: product.id } },
    update: {},
    create: { userId: user.id, productId: product.id },
  });

  await prisma.savedDesign.upsert({
    where: { userId_designId: { userId: user.id, designId: design.id } },
    update: {},
    create: { userId: user.id, designId: design.id, name: design.title },
  });

  console.log({
    ok: true,
    cart: await prisma.cartItem.count({ where: { cartId: cart.id } }),
    wish: await prisma.wishlistItem.count({ where: { userId: user.id } }),
    saved: await prisma.savedDesign.count({ where: { userId: user.id } }),
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
