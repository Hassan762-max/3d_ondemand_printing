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
    { email: "vendor.khi@printora.pk", name: "Sea Port Prints", role: "VENDOR", city: "Karachi" },
    { email: "vendor.lhe@printora.pk", name: "Canal Wear Lab", role: "VENDOR", city: "Lahore" },
    { email: "vendor.isb@printora.pk", name: "Capital DTG", role: "VENDOR", city: "Islamabad" },
    {
      email: "support@printora.pk",
      name: "Support Desk",
      role: "SUPPORT_MANAGER",
      city: "Lahore",
    },
    { email: "qc@printora.pk", name: "QC Lead", role: "QC_MANAGER", city: "Faisalabad" },
    {
      email: "finance@printora.pk",
      name: "Finance Ops",
      role: "FINANCE_MANAGER",
      city: "Islamabad",
    },
    {
      email: "production@printora.pk",
      name: "Production Ops",
      role: "PRODUCTION_MANAGER",
      city: "Lahore",
    },
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

  const vendorSeeds: {
    email: string;
    businessName: string;
    city: string;
    province: string;
    phone: string;
    capacityDaily: number;
    baseCostFactor: number;
    qualityScore: number;
    deliveryScore: number;
    categories: ProductCategory[];
  }[] = [
    {
      email: "vendor@printora.pk",
      businessName: "Print Hub Faisalabad",
      city: "Faisalabad",
      province: "Punjab",
      phone: "+92-300-1111111",
      capacityDaily: 120,
      baseCostFactor: 0.95,
      qualityScore: 4.2,
      deliveryScore: 4.0,
      categories: ["T_SHIRT", "OVERSIZED_T_SHIRT", "HOODIE", "SWEATSHIRT", "CAP"],
    },
    {
      email: "vendor.khi@printora.pk",
      businessName: "Sea Port Prints Karachi",
      city: "Karachi",
      province: "Sindh",
      phone: "+92-300-2222222",
      capacityDaily: 90,
      baseCostFactor: 1.05,
      qualityScore: 4.4,
      deliveryScore: 4.1,
      categories: ["T_SHIRT", "OVERSIZED_T_SHIRT", "POLO", "HOODIE", "CAP"],
    },
    {
      email: "vendor.lhe@printora.pk",
      businessName: "Canal Wear Lab Lahore",
      city: "Lahore",
      province: "Punjab",
      phone: "+92-300-3333333",
      capacityDaily: 100,
      baseCostFactor: 1.0,
      qualityScore: 4.6,
      deliveryScore: 4.5,
      categories: ["T_SHIRT", "OVERSIZED_T_SHIRT", "POLO", "HOODIE", "SWEATSHIRT", "CAP"],
    },
    {
      email: "vendor.isb@printora.pk",
      businessName: "Capital DTG Islamabad",
      city: "Islamabad",
      province: "ICT",
      phone: "+92-300-4444444",
      capacityDaily: 60,
      baseCostFactor: 1.1,
      qualityScore: 4.3,
      deliveryScore: 4.2,
      categories: ["T_SHIRT", "POLO", "HOODIE", "CAP"],
    },
  ];

  for (const v of vendorSeeds) {
    const vendorUser = await prisma.user.findUniqueOrThrow({
      where: { email: v.email },
    });
    const existing = await prisma.vendor.findUnique({
      where: { userId: vendorUser.id },
    });
    if (existing) {
      await prisma.vendor.update({
        where: { id: existing.id },
        data: {
          businessName: v.businessName,
          city: v.city,
          province: v.province,
          phone: v.phone,
          capacityDaily: v.capacityDaily,
          baseCostFactor: v.baseCostFactor,
          qualityScore: v.qualityScore,
          deliveryScore: v.deliveryScore,
          active: true,
        },
      });
      continue;
    }
    await prisma.vendor.create({
      data: {
        userId: vendorUser.id,
        businessName: v.businessName,
        city: v.city,
        province: v.province,
        phone: v.phone,
        capacityDaily: v.capacityDaily,
        baseCostFactor: v.baseCostFactor,
        qualityScore: v.qualityScore,
        deliveryScore: v.deliveryScore,
        capabilities: {
          create: v.categories.map((category) => ({ category })),
        },
      },
    });
  }

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
