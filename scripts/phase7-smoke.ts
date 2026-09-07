import { selectBestVendor } from "../src/lib/fulfillment/router";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.vendor.count({ where: { active: true } });
  const lahore = await selectBestVendor({
    customerCity: "Lahore",
    categories: ["T_SHIRT"],
    units: 2,
  });
  const karachi = await selectBestVendor({
    customerCity: "Karachi",
    categories: ["HOODIE"],
    units: 1,
  });

  console.log({
    ok: true,
    vendors: count,
    lahoreBest: lahore.best
      ? { name: lahore.best.businessName, city: lahore.best.city, score: lahore.best.score }
      : null,
    karachiBest: karachi.best
      ? {
          name: karachi.best.businessName,
          city: karachi.best.city,
          score: karachi.best.score,
        }
      : null,
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
