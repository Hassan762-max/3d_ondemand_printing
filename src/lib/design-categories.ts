/** Shared design discovery categories for homepage + library. */
export const DESIGN_CATEGORIES = [
  "Streetwear",
  "Minimal",
  "Vintage",
  "Anime",
  "Gaming",
  "Typography",
  "Sports",
  "Art",
  "Funny",
  "Trending",
] as const;

export type DesignCategory = (typeof DESIGN_CATEGORIES)[number];

export function normalizeCategory(raw: string | null | undefined) {
  if (!raw) return null;
  const match = DESIGN_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.trim().toLowerCase(),
  );
  return match ?? null;
}

export function designMatchesCategory(tagsJson: string, category: string) {
  try {
    const tags = JSON.parse(tagsJson || "[]") as string[];
    const needle = category.toLowerCase();
    return tags.some((t) => t.toLowerCase() === needle || t.toLowerCase().includes(needle));
  } catch {
    return false;
  }
}
