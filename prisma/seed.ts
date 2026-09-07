import { PrismaClient, ProductCategory, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products: {
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  basePrice: number;
  imageUrl: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
}[] = [
  {
    slug: "essential-tee",
    name: "Essential Tee",
    description: "Soft midweight cotton tee — the everyday print canvas.",
    category: "T_SHIRT",
    basePrice: 1899,
    imageUrl: "/products/tee.svg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Ink", hex: "#12141A" },
      { name: "Bone", hex: "#F2EDE6" },
      { name: "Forest", hex: "#1F6B5A" },
    ],
  },
  {
    slug: "oversized-studio-tee",
    name: "Oversized Studio Tee",
    description: "Dropped shoulder, roomy body — built for statement graphics.",
    category: "OVERSIZED_T_SHIRT",
    basePrice: 2499,
    imageUrl: "/products/oversized.svg",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal", hex: "#2A2D34" },
      { name: "Sand", hex: "#D9D0C3" },
    ],
  },
  {
    slug: "city-polo",
    name: "City Polo",
    description: "Clean collar, breathable pique — subtle chest prints shine.",
    category: "POLO",
    basePrice: 2799,
    imageUrl: "/products/polo.svg",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Navy", hex: "#1B2A4A" },
      { name: "White", hex: "#FAFAF8" },
    ],
  },
  {
    slug: "monsoon-hoodie",
    name: "Monsoon Hoodie",
    description: "Fleece-lined hoodie for cooler evenings and bold back prints.",
    category: "HOODIE",
    basePrice: 4499,
    imageUrl: "/products/hoodie.svg",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#0E1116" },
      { name: "Heather", hex: "#6B6E76" },
    ],
  },
  {
    slug: "crew-sweat",
    name: "Crew Sweat",
    description: "Relaxed crewneck sweatshirt with a smooth print face.",
    category: "SWEATSHIRT",
    basePrice: 3999,
    imageUrl: "/products/sweat.svg",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Stone", hex: "#C9C2B8" },
      { name: "Ink", hex: "#12141A" },
    ],
  },
  {
    slug: "weekend-cap",
    name: "Weekend Cap",
    description: "Structured cap with a crisp front panel for logos and marks.",
    category: "CAP",
    basePrice: 1499,
    imageUrl: "/products/cap.svg",
    sizes: ["OS"],
    colors: [
      { name: "Black", hex: "#0E1116" },
      { name: "Khaki", hex: "#A8906C" },
    ],
  },
];

const libraryDesigns = [
  {
    title: "Karachi Grid",
    description: "Abstract city grid in deep teal.",
    imageUrl: "/designs/karachi-grid.svg",
    tags: ["city", "abstract", "teal"],
  },
  {
    title: "Indus Line",
    description: "Minimal river-inspired mark.",
    imageUrl: "/designs/indus-line.svg",
    tags: ["minimal", "nature"],
  },
  {
    title: "Night Bazaar",
    description: "Neon market energy, restrained palette.",
    imageUrl: "/designs/night-bazaar.svg",
    tags: ["night", "graphic"],
  },
  {
    title: "Type Specimen PK",
    description: "Editorial typography lockup.",
    imageUrl: "/designs/type-specimen.svg",
    tags: ["type", "editorial"],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const users: { email: string; name: string; role: Role; city: string }[] = [
    { email: "customer@printora.pk", name: "Ayesha Khan", role: "CUSTOMER", city: "Lahore" },
    { email: "designer@printora.pk", name: "Hassan Ali", role: "DESIGNER", city: "Karachi" },
    { email: "vendor@printora.pk", name: "Print Hub PK", role: "VENDOR", city: "Faisalabad" },
    { email: "admin@printora.pk", name: "Printora Admin", role: "ADMIN", city: "Islamabad" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        city: u.city,
        passwordHash,
      },
    });
  }

  const vendorUser = await prisma.user.findUniqueOrThrow({
    where: { email: "vendor@printora.pk" },
  });

  await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: "Print Hub Faisalabad",
      city: "Faisalabad",
      province: "Punjab",
      phone: "+92-300-0000000",
      capacityDaily: 120,
      capabilities: {
        create: [
          { category: "T_SHIRT" },
          { category: "OVERSIZED_T_SHIRT" },
          { category: "HOODIE" },
          { category: "SWEATSHIRT" },
          { category: "CAP" },
        ],
      },
    },
  });

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        imageUrl: p.imageUrl,
        active: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category,
        basePrice: p.basePrice,
        imageUrl: p.imageUrl,
      },
    });

    for (const size of p.sizes) {
      for (const color of p.colors) {
        const sku = `${p.slug}-${size}-${color.name}`.toUpperCase().replaceAll(" ", "-");
        await prisma.productVariant.upsert({
          where: { sku },
          update: {},
          create: {
            productId: product.id,
            sku,
            size,
            color: color.name,
            colorHex: color.hex,
          },
        });
      }
    }
  }

  for (const d of libraryDesigns) {
    const existing = await prisma.design.findFirst({
      where: { title: d.title, isLibrary: true },
    });
    if (!existing) {
      await prisma.design.create({
        data: {
          title: d.title,
          description: d.description,
          imageUrl: d.imageUrl,
          thumbnailUrl: d.imageUrl,
          isLibrary: true,
          tags: JSON.stringify(d.tags),
        },
      });
    }
  }

  console.log("Seed complete. Demo password for all users: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
