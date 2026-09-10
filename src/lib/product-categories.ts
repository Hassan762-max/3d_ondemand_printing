/** Shared product catalog category labels + helpers. */
export const PRODUCT_CATEGORY_OPTIONS = [
  { value: "T_SHIRT", label: "T-Shirt" },
  { value: "OVERSIZED_T_SHIRT", label: "Drop Shoulder" },
  { value: "HOODIE", label: "Hoodie" },
  { value: "SWEATSHIRT", label: "Sweatshirt" },
  { value: "JACKET", label: "Jacket" },
  { value: "CAP", label: "Cap" },
] as const;

export type ProductCategoryValue =
  (typeof PRODUCT_CATEGORY_OPTIONS)[number]["value"];

export function normalizeProductCategory(raw: string | null | undefined) {
  if (!raw) return null;
  const match = PRODUCT_CATEGORY_OPTIONS.find(
    (c) => c.value === raw.trim().toUpperCase() || c.label.toLowerCase() === raw.trim().toLowerCase(),
  );
  return match?.value ?? null;
}

export function productCategoryLabel(category: string) {
  return (
    PRODUCT_CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category
  );
}
