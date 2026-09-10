import type { ProductCategory } from "@prisma/client";

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

export function catalogCategoryTag(category: string) {
  return CATEGORY_TAG[category] ?? category.replaceAll("_", " ");
}

export function catalogFitForSlug(slug: string): CatalogFit {
  return FIT_BY_SLUG[slug] ?? "regular";
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
