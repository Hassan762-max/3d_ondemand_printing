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
    name: "Tee",
    description: "Soft midweight cotton — the everyday print canvas.",
    category: "T_SHIRT",
    basePrice: 1899,
    imageUrl: "/products/tee.png",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Ink", hex: "#12141A" },
      { name: "Bone", hex: "#F2EDE6" },
      { name: "Forest", hex: "#1F6B5A" },
    ],
  },
  {
    slug: "oversized-studio-tee",
    name: "Plain Drop Shoulder Shirt",
    description: "Plain drop-shoulder blank — roomy body for statement graphics.",
    category: "OVERSIZED_T_SHIRT",
    basePrice: 2499,
    imageUrl: "/products/oversized.png",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal", hex: "#2A2D34" },
      { name: "Sand", hex: "#D9D0C3" },
      { name: "Ink", hex: "#12141A" },
    ],
  },
  {
    slug: "city-polo",
    name: "Polo",
    description: "Clean collar, breathable pique — subtle chest prints shine.",
    category: "POLO",
    basePrice: 2799,
    imageUrl: "/products/polo.png",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Navy", hex: "#1B2A4A" },
      { name: "White", hex: "#FAFAF8" },
    ],
  },
  {
    slug: "monsoon-hoodie",
    name: "Hoodie",
    description: "Fleece-lined for cooler evenings and bold back prints.",
    category: "HOODIE",
    basePrice: 4499,
    imageUrl: "/products/hoodie.png",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", hex: "#0E1116" },
      { name: "Heather", hex: "#6B6E76" },
    ],
  },
  {
    slug: "crew-sweat",
    name: "Sweatshirt",
    description: "Relaxed crewneck with a smooth print face.",
    category: "SWEATSHIRT",
    basePrice: 3999,
    imageUrl: "/products/sweat.png",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Stone", hex: "#C9C2B8" },
      { name: "Ink", hex: "#12141A" },
    ],
  },
  {
    slug: "weekend-cap",
    name: "Cap",
    description: "Structured front panel for logos and marks.",
    category: "CAP",
    basePrice: 1499,
    imageUrl: "/products/cap.png",
    sizes: ["OS"],
    colors: [
      { name: "Black", hex: "#0E1116" },
      { name: "Khaki", hex: "#A8906C" },
    ],
  },
  {
    slug: "everyday-casual-shirt",
    name: "Shirt",
    description: "Lightweight button-down with a clean back print panel.",
    category: "CASUAL_SHIRT",
    basePrice: 3299,
    imageUrl: "/products/shirt.png",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Sky", hex: "#C5D4E0" },
      { name: "Ink", hex: "#12141A" },
    ],
  },
  {
    slug: "city-shell-jacket",
    name: "Jacket",
    description: "Light shell for layering — large back print zone.",
    category: "JACKET",
    basePrice: 5499,
    imageUrl: "/products/jacket.png",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Olive", hex: "#3F4A3A" },
      { name: "Black", hex: "#0E1116" },
    ],
  },
  {
    slug: "studio-joggers",
    name: "Joggers",
    description: "Tapered fleece bottoms — comfort for everyday wear.",
    category: "JOGGERS",
    basePrice: 3599,
    imageUrl: "/products/joggers.png",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal", hex: "#2A2D34" },
      { name: "Stone", hex: "#C9C2B8" },
    ],
  },
  {
    slug: "court-shorts",
    name: "Shorts",
    description: "Breathable shorts with a small side-panel print option.",
    category: "SHORTS",
    basePrice: 2199,
    imageUrl: "/products/shorts.png",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Navy", hex: "#1B2A4A" },
      { name: "Bone", hex: "#F2EDE6" },
    ],
  },
];

const libraryDesigns = [
  {
    title: "Karachi Grid",
    description: "Abstract city grid in deep teal.",
    imageUrl: "/designs/karachi-grid.png",
    tags: ["Streetwear", "Abstract", "Trending"],
  },
  {
    title: "Indus Line",
    description: "Minimal river-inspired mark.",
    imageUrl: "/designs/indus-line.png",
    tags: ["Minimal", "Abstract"],
  },
  {
    title: "Night Bazaar",
    description: "Neon market energy, restrained palette.",
    imageUrl: "/designs/night-bazaar.png",
    tags: ["Streetwear", "Vintage", "Abstract"],
  },
  {
    title: "Type Specimen",
    description: "Editorial typography lockup.",
    imageUrl: "/designs/type-specimen.png",
    tags: ["Typography", "Minimal", "Vintage"],
  },
  {
    title: "Anime Pulse",
    description: "Modern anime-inspired motion graphic.",
    imageUrl: "/designs/anime-pulse.png",
    tags: ["Anime", "Streetwear"],
  },
  {
    title: "Y2K Chrome",
    description: "Liquid chrome energy for early-2000s vibes.",
    imageUrl: "/designs/y2k-chrome.png",
    tags: ["Y2K", "Streetwear", "Abstract"],
  },
  {
    title: "Sakura Gaze",
    description: "Anime-inspired eye with cherry blossom ink.",
    imageUrl: "/designs/anime-sakura-gaze.png",
    tags: ["Anime", "Streetwear"],
  },
  {
    title: "Mecha Core",
    description: "Futurist mecha helm for neon streetwear.",
    imageUrl: "/designs/anime-mecha-core.png",
    tags: ["Anime", "Y2K", "Abstract"],
  },
  {
    title: "Moon Ronin",
    description: "Original anime warrior under moonlight.",
    imageUrl: "/designs/anime-moon-ronin.png",
    tags: ["Anime", "Streetwear", "Vintage"],
  },
  {
    title: "Great Wave",
    description: "Ukiyo-e wave energy for modern prints.",
    imageUrl: "/designs/culture-great-wave.png",
    tags: ["Culture", "Vintage", "Abstract"],
  },
  {
    title: "Aztec Sun",
    description: "Mexica sun-stone geometry in terracotta gold.",
    imageUrl: "/designs/culture-aztec-sun.png",
    tags: ["Culture", "Streetwear"],
  },
  {
    title: "Mandala Flow",
    description: "Indian sacred geometry in saffron and gold.",
    imageUrl: "/designs/culture-mandala.png",
    tags: ["Culture", "Minimal"],
  },
  {
    title: "Sahel Geometry",
    description: "West African textile rhythm in ochre and ink.",
    imageUrl: "/designs/culture-sahel-geo.png",
    tags: ["Culture", "Abstract", "Streetwear"],
  },
  {
    title: "Cloud Dragon",
    description: "Chinese cloud-and-dragon motif, reimagined.",
    imageUrl: "/designs/culture-cloud-dragon.png",
    tags: ["Culture", "Vintage", "Streetwear"],
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
    { email: "admin@printora.pk", name: "Nivaro Admin", role: "ADMIN", city: "Islamabad" },
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
      categories: [
        "T_SHIRT",
        "OVERSIZED_T_SHIRT",
        "HOODIE",
        "SWEATSHIRT",
        "CAP",
        "JOGGERS",
        "SHORTS",
      ],
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
      categories: [
        "T_SHIRT",
        "OVERSIZED_T_SHIRT",
        "POLO",
        "HOODIE",
        "CAP",
        "CASUAL_SHIRT",
        "SHORTS",
      ],
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
      categories: [
        "T_SHIRT",
        "OVERSIZED_T_SHIRT",
        "POLO",
        "HOODIE",
        "SWEATSHIRT",
        "CAP",
        "CASUAL_SHIRT",
        "JACKET",
        "JOGGERS",
        "SHORTS",
      ],
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
      categories: ["T_SHIRT", "POLO", "HOODIE", "CAP", "JACKET", "CASUAL_SHIRT"],
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
      for (const category of v.categories) {
        await prisma.vendorCapability.upsert({
          where: {
            vendorId_category: { vendorId: existing.id, category },
          },
          update: {},
          create: { vendorId: existing.id, category },
        });
      }
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

  // Rename legacy library title if present
  const legacyType = await prisma.design.findFirst({
    where: { title: "Type Specimen PK", isLibrary: true },
  });
  if (legacyType) {
    await prisma.design.update({
      where: { id: legacyType.id },
      data: {
        title: "Type Specimen",
        imageUrl: "/designs/type-specimen.png",
        thumbnailUrl: "/designs/type-specimen.png",
        tags: JSON.stringify(["Typography", "Minimal", "Vintage"]),
      },
    });
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
    } else {
      await prisma.design.update({
        where: { id: existing.id },
        data: {
          description: d.description,
          imageUrl: d.imageUrl,
          thumbnailUrl: d.imageUrl,
          tags: JSON.stringify(d.tags),
        },
      });
    }
  }

  const designer = await prisma.user.findUnique({
    where: { email: "designer@printora.pk" },
  });
  if (designer) {
    const creatorListings = [
      {
        title: "Canal Road Mark",
        description: "Bold Lahore canal geometry for chest prints.",
        imageUrl: "/designs/karachi-grid.png",
        listedPrice: 299,
        tags: ["Streetwear", "Abstract", "creator"],
      },
      {
        title: "Monsoon Script",
        description: "Free brush lettering — monsoon nights.",
        imageUrl: "/designs/indus-line.png",
        listedPrice: 0,
        tags: ["Typography", "Minimal", "creator"],
      },
    ];
    for (const listing of creatorListings) {
      const existing = await prisma.design.findFirst({
        where: { title: listing.title, ownerId: designer.id },
      });
      if (!existing) {
        await prisma.design.create({
          data: {
            ownerId: designer.id,
            title: listing.title,
            description: listing.description,
            imageUrl: listing.imageUrl,
            thumbnailUrl: listing.imageUrl,
            isLibrary: false,
            published: true,
            listedPrice: listing.listedPrice,
            moderationStatus: "approved",
            tags: JSON.stringify(listing.tags),
          },
        });
      } else {
        await prisma.design.update({
          where: { id: existing.id },
          data: {
            published: true,
            listedPrice: listing.listedPrice,
            moderationStatus: "approved",
            imageUrl: listing.imageUrl,
            thumbnailUrl: listing.imageUrl,
            tags: JSON.stringify(listing.tags),
          },
        });
      }
    }
  }

  const customer = await prisma.user.findUnique({
    where: { email: "customer@printora.pk" },
  });
  if (customer) {
    await prisma.styleProfile.upsert({
      where: { userId: customer.id },
      create: {
        userId: customer.id,
        preferences: JSON.stringify({
          fit: "oversized",
          styles: ["Minimal", "Streetwear"],
        }),
        sizes: JSON.stringify({ default: "M" }),
      },
      update: {
        preferences: JSON.stringify({
          fit: "oversized",
          styles: ["Minimal", "Streetwear"],
        }),
        sizes: JSON.stringify({ default: "M" }),
      },
    });
    await prisma.user.update({
      where: { id: customer.id },
      data: {
        phone: customer.phone ?? "03001234567",
        province: customer.province ?? "Punjab",
      },
    });
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
