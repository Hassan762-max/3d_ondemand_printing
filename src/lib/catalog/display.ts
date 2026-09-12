import type { ProductCategory } from "@prisma/client";

/** Removed from storefront, portals, studio, and try-on. */
export const HIDDEN_CATALOG_SLUGS = [
  "studio-joggers",
  "court-shorts",
  "city-polo",
  "everyday-casual-shirt",
] as const;

export function catalogProductWhere(extra: Record<string, unknown> = {}) {
  return {
    active: true,
    ...extra,
    slug: { notIn: [...HIDDEN_CATALOG_SLUGS] },
  };
}

export function isHiddenCatalogSlug(slug: string) {
  return (HIDDEN_CATALOG_SLUGS as readonly string[]).includes(slug);
}

/** Soft charcoal — shown as Charcoal Grey (legacy DB rows may still say Black). */
export const CHARCOAL_GREY_HEX = "#525866";

export function catalogColorLabel(color: string) {
  return color === "Black" ? "Charcoal Grey" : color;
}

export function catalogColorHex(color: string, hex: string) {
  if (color === "Black" || color === "Charcoal Grey") return CHARCOAL_GREY_HEX;
  return hex;
}

export function catalogColorOption(color: string, hex: string) {
  const name = catalogColorLabel(color);
  return { name, hex: catalogColorHex(color, hex) };
}

/** Match cart/try-on color against DB variants (Black ↔ Charcoal Grey). */
export function catalogColorAliases(color: string) {
  if (color === "Charcoal Grey" || color === "Black") {
    return ["Charcoal Grey", "Black"];
  }
  return [color];
}

/** Simplified fashion names shown in catalog (DB may keep longer legacy names). */
const DISPLAY_NAMES: Record<string, string> = {
  "essential-tee": "Tee",
  "oversized-studio-tee": "Drop Shoulder",
  "city-polo": "Polo",
  "monsoon-hoodie": "Hoodie",
  "crew-sweat": "Sweatshirt",
  "weekend-cap": "Cap",
  "everyday-casual-shirt": "Shirt",
  "city-shell-jacket": "Jacket",
  "studio-joggers": "Joggers",
  "court-shorts": "Shorts",
};

/** Premium photorealistic catalog assets (fall back to SVG if missing). */
const CATALOG_IMAGES: Record<string, string> = {
  "essential-tee": "/products/tee.png",
  "oversized-studio-tee": "/products/oversized.png",
  "city-polo": "/products/polo.png",
  "monsoon-hoodie": "/products/hoodie.png",
  "crew-sweat": "/products/sweat.png",
  "weekend-cap": "/products/cap.png",
  "everyday-casual-shirt": "/products/shirt.png",
  "city-shell-jacket": "/products/jacket.png",
  "studio-joggers": "/products/joggers.png",
  "court-shorts": "/products/shorts.png",
};

/** Rear-view photoreal blanks for PDP front/back preview. */
const CATALOG_BACK_IMAGES: Record<string, string> = {
  "essential-tee": "/products/tee-back.png",
  "oversized-studio-tee": "/products/oversized-back.png",
  "monsoon-hoodie": "/products/hoodie-back.png",
  "crew-sweat": "/products/sweat-back.png",
  "city-shell-jacket": "/products/jacket-back.png",
};

const CATEGORY_TAG: Record<string, string> = {
  T_SHIRT: "TEE",
  OVERSIZED_T_SHIRT: "DROP SHOULDER",
  POLO: "POLO",
  HOODIE: "HEAVYWEIGHT",
  SWEATSHIRT: "FLEECE",
  CASUAL_SHIRT: "SHIRT",
  JACKET: "JACKET",
  JOGGERS: "BOTTOMS",
  SHORTS: "BOTTOMS",
  CAP: "ACCESSORY",
};

export type CatalogGroup =
  | "all"
  | "tshirts"
  | "hoodies"
  | "outerwear"
  | "accessories";

export const CATALOG_GROUPS: { id: CatalogGroup; label: string; categories: ProductCategory[] }[] =
  [
    { id: "all", label: "All", categories: [] },
    {
      id: "tshirts",
      label: "T-Shirts",
      categories: ["T_SHIRT", "OVERSIZED_T_SHIRT"],
    },
    {
      id: "hoodies",
      label: "Hoodies",
      categories: ["HOODIE", "SWEATSHIRT"],
    },
    {
      id: "outerwear",
      label: "Outerwear",
      categories: ["JACKET"],
    },
    {
      id: "accessories",
      label: "Accessories",
      categories: ["CAP"],
    },
  ];

export type CatalogFit = "oversized" | "regular" | "slim";

export const CATALOG_FITS: { id: CatalogFit | "all"; label: string }[] = [
  { id: "all", label: "All fits" },
  { id: "oversized", label: "Oversized" },
  { id: "regular", label: "Regular" },
  { id: "slim", label: "Slim" },
];

export type CatalogSort = "popular" | "price" | "newest" | "price-asc" | "price-desc";

export const CATALOG_SORTS: { id: CatalogSort; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "price", label: "Price" },
  { id: "newest", label: "Newest" },
];

const FIT_BY_SLUG: Record<string, CatalogFit> = {
  "essential-tee": "regular",
  "oversized-studio-tee": "oversized",
  "city-polo": "slim",
  "monsoon-hoodie": "oversized",
  "crew-sweat": "regular",
  "weekend-cap": "regular",
  "everyday-casual-shirt": "regular",
  "city-shell-jacket": "regular",
  "studio-joggers": "regular",
  "court-shorts": "regular",
};

export function catalogDisplayName(slug: string, fallbackName: string) {
  return DISPLAY_NAMES[slug] ?? simplifyProductName(fallbackName);
}

export function simplifyProductName(name: string) {
  return name
    .replace(/^(Essential|Oversized Studio|City Shell|City|Monsoon|Crew|Weekend|Everyday Casual|Studio|Court)\s+/i, "")
    .replace(/\s+Studio\s+/i, " ")
    .trim() || name;
}

export function catalogImageUrl(slug: string, fallback?: string | null) {
  return CATALOG_IMAGES[slug] ?? fallback ?? "/products/tee.png";
}

export function catalogBackImageUrl(slug: string, frontFallback?: string | null) {
  const path = CATALOG_BACK_IMAGES[slug] ?? catalogImageUrl(slug, frontFallback);
  // Bust stale SVG/CDN caches from earlier preview assets.
  return path.includes("?") ? path : `${path}?v=photo`;
}

export function catalogCategoryTag(category: string) {
  return CATEGORY_TAG[category] ?? category.replaceAll("_", " ");
}

export function catalogFitForSlug(slug: string): CatalogFit {
  return FIT_BY_SLUG[slug] ?? "regular";
}

export type ProductSpecs = {
  material: string;
  quality: string;
  care?: string;
};

const PRODUCT_SPECS: Record<string, ProductSpecs> = {
  "essential-tee": {
    material:
      "100% combed cotton jersey, midweight (~180 GSM). Smooth face ideal for chest and full-front prints.",
    quality:
      "Pre-shrunk blank with reinforced shoulder seams. Soft hand-feel that stays stable after wash and press.",
    care: "Wash cold inside-out; tumble low or hang dry to protect the print.",
  },
  "oversized-studio-tee": {
    material:
      "Heavy cotton jersey with a drop-shoulder cut (~220 GSM). Extra body room for large graphics.",
    quality:
      "Relaxed drape without thin see-through panels. Dense knit holds DTG and DTF ink cleanly.",
    care: "Wash cold inside-out; avoid high heat on the printed area.",
  },
  "monsoon-hoodie": {
    material:
      "Fleece-lined cotton blend (~320–350 GSM). Soft brushed interior with a smooth outer face for bold prints.",
    quality:
      "Heavyweight build, double-stitched seams, and a durable print zone on chest and back. Sized for a roomy oversized fit.",
    care: "Wash cold inside-out; hang dry preferred so fleece and print stay sharp.",
  },
  "crew-sweat": {
    material:
      "French terry / fleece crew (~280 GSM) with a clean knit face for crisp artwork.",
    quality:
      "Stable neckline rib and even print surface across the chest. Built for everyday wear without pilling quickly.",
    care: "Wash cold; reshape and hang dry.",
  },
  "weekend-cap": {
    material:
      "Structured cotton twill front panels with adjustable rear strap.",
    quality:
      "Firm front panel keeps logos sharp; breathable build for all-day wear.",
    care: "Spot clean or gentle hand wash; air dry.",
  },
  "city-shell-jacket": {
    material:
      "Lightweight woven shell with a large back panel ready for statement prints.",
    quality:
      "Smooth exterior accepts large-format prints; light enough to layer without bulk.",
    care: "Gentle wash or wipe clean; hang dry.",
  },
};

const SPECS_BY_CATEGORY: Partial<Record<string, ProductSpecs>> = {
  T_SHIRT: PRODUCT_SPECS["essential-tee"],
  OVERSIZED_T_SHIRT: PRODUCT_SPECS["oversized-studio-tee"],
  HOODIE: PRODUCT_SPECS["monsoon-hoodie"],
  SWEATSHIRT: PRODUCT_SPECS["crew-sweat"],
  CAP: PRODUCT_SPECS["weekend-cap"],
  JACKET: PRODUCT_SPECS["city-shell-jacket"],
};

const DEFAULT_SPECS: ProductSpecs = {
  material:
    "Premium blank selected for clean print adhesion and everyday comfort.",
  quality:
    "Inspected for seams, fabric hand, and print-face consistency before fulfillment.",
  care: "Wash cold inside-out; hang dry when possible.",
};

export function catalogProductSpecs(
  slug: string,
  category?: string,
): ProductSpecs {
  return (
    PRODUCT_SPECS[slug] ??
    (category ? SPECS_BY_CATEGORY[category] : undefined) ??
    DEFAULT_SPECS
  );
}

/** CSS print-zone placement for live PDP mockups (percent of frame). */
export type PrintZone = {
  widthPct: number;
  topPct: number;
  /** Horizontal center of the logo (default 50). */
  leftPct?: number;
  /** Optional max height; caps use a small front logo. */
  maxHeightPct?: number;
  /**
   * Optional 3D surface transform so artwork follows a tilted garment panel
   * (e.g. cap front crown in 3/4 view). Percent placement stays responsive.
   */
  surface?: {
    perspectivePx?: number;
    rotateXDeg?: number;
    rotateYDeg?: number;
    rotateZDeg?: number;
    skewXDeg?: number;
    skewYDeg?: number;
  };
};

export type PrintZones = {
  front: PrintZone;
  back: PrintZone;
};

const PRINT_ZONES: Record<string, PrintZones> = {
  "essential-tee": {
    front: { widthPct: 42, topPct: 34 },
    back: { widthPct: 48, topPct: 30 },
  },
  "oversized-studio-tee": {
    front: { widthPct: 44, topPct: 36 },
    back: { widthPct: 52, topPct: 32 },
  },
  "monsoon-hoodie": {
    front: { widthPct: 40, topPct: 33 },
    back: { widthPct: 46, topPct: 32 },
  },
  "crew-sweat": {
    front: { widthPct: 42, topPct: 34 },
    back: { widthPct: 50, topPct: 30 },
  },
  // Cap 3/4 facing left: front logo sits on the face-on front panel
  // (viewer-right of the center seam), mid-crown — matches red-circle target.
  "weekend-cap": {
    front: {
      widthPct: 11,
      topPct: 43,
      leftPct: 62,
      maxHeightPct: 8,
      surface: {
        perspectivePx: 750,
        rotateXDeg: 8,
        rotateYDeg: -14,
        rotateZDeg: -6,
        skewXDeg: 1,
      },
    },
    back: {
      widthPct: 10,
      topPct: 40,
      leftPct: 50,
      maxHeightPct: 8,
    },
  },
  "city-shell-jacket": {
    front: { widthPct: 36, topPct: 36 },
    back: { widthPct: 55, topPct: 26 },
  },
};

const DEFAULT_PRINT_ZONES: PrintZones = {
  front: { widthPct: 40, topPct: 34 },
  back: { widthPct: 48, topPct: 30 },
};

export function catalogPrintZones(slug: string): PrintZones {
  return PRINT_ZONES[slug] ?? DEFAULT_PRINT_ZONES;
}

export function normalizeCatalogGroup(raw: string | null | undefined): CatalogGroup {
  const id = (raw || "all").toLowerCase() as CatalogGroup;
  return CATALOG_GROUPS.some((g) => g.id === id) ? id : "all";
}

export function normalizeCatalogFit(raw: string | null | undefined): CatalogFit | "all" {
  if (!raw || raw === "all") return "all";
  return CATALOG_FITS.some((f) => f.id === raw) ? (raw as CatalogFit | "all") : "all";
}

export function normalizeCatalogSort(raw: string | null | undefined): CatalogSort {
  if (!raw) return "popular";
  if (raw === "price-asc" || raw === "price") return "price";
  if (raw === "price-desc") return "price-desc";
  return CATALOG_SORTS.some((s) => s.id === raw) ? (raw as CatalogSort) : "popular";
}

export function categoriesForGroup(group: CatalogGroup): ProductCategory[] | null {
  if (group === "all") return null;
  return CATALOG_GROUPS.find((g) => g.id === group)?.categories ?? null;
}
