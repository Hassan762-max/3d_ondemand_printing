/** Shared design discovery categories for library + homepage chips. */
export const DESIGN_CATEGORIES = [
  "Typography",
  "Minimal",
  "Streetwear",
  "Abstract",
  "Anime",
  "Y2K",
  "Vintage",
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
    return tags.some(
      (t) => t.toLowerCase() === needle || t.toLowerCase().includes(needle),
    );
  } catch {
    return false;
  }
}

export function parseDesignTags(tagsJson: string) {
  try {
    return (JSON.parse(tagsJson || "[]") as string[]).filter(Boolean);
  } catch {
    return [] as string[];
  }
}

/** Prefer curated style tags for display pills. */
export function designStyleTags(tagsJson: string, limit = 3) {
  const tags = parseDesignTags(tagsJson);
  const preferred = DESIGN_CATEGORIES.map((c) => c.toLowerCase());
  const styled = tags.filter((t) => preferred.includes(t.toLowerCase()));
  const rest = tags.filter((t) => !preferred.includes(t.toLowerCase()));
  return [...styled, ...rest].slice(0, limit);
}
