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
  } as {
    active: boolean;
    slug: { notIn: string[] };
    [key: string]: unknown;
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

/** Cart / studio placement payload derived from a PDP print zone. */
export type CartPlacement = {
  side: "front" | "back";
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

/** One print side inside a dual-sided cart/order placement payload. */
export type CartSidePlacement = {
  designId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

/**
 * Dual-sided cart placement stored in `placementJson`.
 * Legacy rows keep the flat `{ side, x, y, scale, rotation }` shape;
 * new PDP adds may include `front` / `back` (omit a side for blank).
 */
export type DualCartPlacement = {
  /** Active / legacy side hint (kept for studio + older consumers). */
  side: "front" | "back";
  x: number;
  y: number;
  scale: number;
  rotation: number;
  front?: CartSidePlacement | null;
  back?: CartSidePlacement | null;
};

/**
 * Map CSS print-zone percents → cart/studio placement.
 * `scale` is relative to the catalog baseline width for that side (1 = default).
 */
export function printZoneToCartPlacement(
  zone: PrintZone,
  side: "front" | "back",
  baseline: PrintZone,
): CartPlacement {
  const baseWidth = Math.max(baseline.widthPct, 1);
  return {
    side,
    x: (zone.leftPct ?? 50) / 100,
    y: zone.topPct / 100,
    scale: Math.round((zone.widthPct / baseWidth) * 1000) / 1000,
    rotation: 0,
  };
}

function normalizeSidePlacement(
  raw: unknown,
): CartSidePlacement | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  const designId = typeof rec.designId === "string" ? rec.designId.trim() : "";
  if (!designId) return null;
  return {
    designId,
    x: Number(rec.x ?? 0.5),
    y: Number(rec.y ?? 0.4),
    scale: Number(rec.scale ?? 1),
    rotation: Number(rec.rotation ?? 0),
  };
}

/** Parse cart/order placement JSON; supports legacy single-side and dual-side shapes. */
export function parseDualCartPlacement(
  raw: string | Record<string, unknown> | null | undefined,
): DualCartPlacement {
  let parsed: Record<string, unknown> = {};
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw || "{}") as Record<string, unknown>;
    } catch {
      parsed = {};
    }
  } else if (raw && typeof raw === "object") {
    parsed = raw;
  }

  const side = parsed.side === "back" ? "back" : "front";
  const legacy: CartPlacement = {
    side,
    x: Number(parsed.x ?? 0.5),
    y: Number(parsed.y ?? 0.4),
    scale: Number(parsed.scale ?? 1),
    rotation: Number(parsed.rotation ?? 0),
  };

  const hasDualKeys = "front" in parsed || "back" in parsed;
  const front = normalizeSidePlacement(parsed.front);
  const back = normalizeSidePlacement(parsed.back);

  // Legacy row: no front/back keys — treat active side coords as that side only
  // when a top-level designId is present (studio / older cart).
  if (
    !hasDualKeys &&
    typeof parsed.designId === "string" &&
    parsed.designId.trim()
  ) {
    const sidePlacement: CartSidePlacement = {
      designId: parsed.designId.trim(),
      x: legacy.x,
      y: legacy.y,
      scale: legacy.scale,
      rotation: legacy.rotation,
    };
    return {
      ...legacy,
      front: side === "front" ? sidePlacement : null,
      back: side === "back" ? sidePlacement : null,
    };
  }

  if (hasDualKeys) {
    return {
      ...legacy,
      front,
      back,
    };
  }

  return legacy;
}

/** Primary design FK for CartItem/OrderItem (front preferred, else back). */
export function primaryDesignIdFromPlacement(
  placement: DualCartPlacement,
  fallbackDesignId?: string | null,
): string | null {
  return (
    placement.front?.designId ??
    placement.back?.designId ??
    fallbackDesignId ??
    null
  );
}

/** All design IDs referenced by a dual (or legacy) placement. */
export function designIdsFromPlacement(placement: DualCartPlacement): string[] {
  const ids = new Set<string>();
  if (placement.front?.designId) ids.add(placement.front.designId);
  if (placement.back?.designId) ids.add(placement.back.designId);
  return [...ids];
}

/** Build dual placement JSON for cart persistence. */
export function buildDualCartPlacement(input: {
  front: (CartPlacement & { designId: string }) | null;
  back: (CartPlacement & { designId: string }) | null;
  activeSide?: "front" | "back";
}): DualCartPlacement {
  const activeSide =
    input.activeSide ??
    (input.front ? "front" : input.back ? "back" : "front");
  const active =
    (activeSide === "front" ? input.front : input.back) ??
    input.front ??
    input.back;

  return {
    side: activeSide,
    x: active?.x ?? 0.5,
    y: active?.y ?? 0.4,
    scale: active?.scale ?? 1,
    rotation: active?.rotation ?? 0,
    front: input.front
      ? {
          designId: input.front.designId,
          x: input.front.x,
          y: input.front.y,
          scale: input.front.scale,
          rotation: input.front.rotation,
        }
      : null,
    back: input.back
      ? {
          designId: input.back.designId,
          x: input.back.x,
          y: input.back.y,
          scale: input.back.scale,
          rotation: input.back.rotation,
        }
      : null,
  };
}

export function serializeDualCartPlacement(placement: DualCartPlacement): string {
  const payload: Record<string, unknown> = {
    side: placement.side,
    x: placement.x,
    y: placement.y,
    scale: placement.scale,
    rotation: placement.rotation,
  };
  if ("front" in placement || "back" in placement) {
    payload.front = placement.front ?? null;
    payload.back = placement.back ?? null;
  }
  return JSON.stringify(payload);
}

/** Human-readable print label for cart/order lines (front/back aware). */
export function formatPrintLabel(
  placementJson: string | null | undefined,
  primaryDesign: { id: string; title: string } | null | undefined,
  titleById?: Map<string, string> | Record<string, string>,
): string | null {
  const placement = parseDualCartPlacement(placementJson);
  const lookup = (id: string) => {
    if (primaryDesign?.id === id) return primaryDesign.title;
    if (!titleById) return undefined;
    if (titleById instanceof Map) return titleById.get(id);
    return titleById[id];
  };

  const frontTitle = placement.front?.designId
    ? lookup(placement.front.designId)
    : null;
  const backTitle = placement.back?.designId
    ? lookup(placement.back.designId)
    : null;

  if (frontTitle && backTitle) {
    return frontTitle === backTitle
      ? `Front & back · ${frontTitle}`
      : `Front · ${frontTitle} · Back · ${backTitle}`;
  }
  if (frontTitle) {
    return "front" in placement || "back" in placement
      ? `Front · ${frontTitle}`
      : frontTitle;
  }
  if (backTitle) return `Back · ${backTitle}`;
  return primaryDesign?.title ?? null;
}

export function formatOrderItemTitle(
  productName: string,
  placementJson: string | null | undefined,
  primaryDesign: { id: string; title: string } | null | undefined,
  titleById?: Map<string, string> | Record<string, string>,
): string {
  const label = formatPrintLabel(placementJson, primaryDesign, titleById);
  return label ? `${productName} · ${label}` : productName;
}

const PRINT_ZONES: Record<string, PrintZones> = {
  "essential-tee": {
    front: { widthPct: 42, topPct: 34 },
    back: { widthPct: 48, topPct: 30 },
  },
  // Drop-shoulder blank is wide; default maxHeight 48% makes tall art (e.g. Cloud Dragon)
  // read as full-torso. Keep chest / upper-back POD scale below the collar.
  "oversized-studio-tee": {
    front: { widthPct: 34, topPct: 42, maxHeightPct: 28 },
    back: { widthPct: 38, topPct: 40, maxHeightPct: 30 },
  },
  // Hood occupies the upper third — keep chest/back prints below neckline & hood tip
  // (tee-like topPct ~32–34 bleeds onto hood/drawstrings with tall artwork).
  "monsoon-hoodie": {
    front: { widthPct: 34, topPct: 47, maxHeightPct: 24 },
    back: { widthPct: 40, topPct: 52, maxHeightPct: 30 },
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
