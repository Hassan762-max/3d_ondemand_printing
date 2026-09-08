export type StylePreferences = {
  fit?: string;
  styles?: string[];
};

export type StyleSizes = {
  default?: string;
};

export function parseStylePreferences(raw: string | null | undefined): StylePreferences {
  try {
    const data = JSON.parse(raw || "{}") as StylePreferences;
    return {
      fit: typeof data.fit === "string" ? data.fit : undefined,
      styles: Array.isArray(data.styles)
        ? data.styles.filter((s): s is string => typeof s === "string")
        : undefined,
    };
  } catch {
    return {};
  }
}

export function parseStyleSizes(raw: string | null | undefined): StyleSizes {
  try {
    const data = JSON.parse(raw || "{}") as StyleSizes;
    return {
      default: typeof data.default === "string" ? data.default : undefined,
    };
  } catch {
    return {};
  }
}

export function styleContextNote(preferences: StylePreferences, sizes: StyleSizes) {
  const parts: string[] = [];
  if (sizes.default) parts.push(`preferred size ${sizes.default}`);
  if (preferences.fit) parts.push(`${preferences.fit} fit`);
  if (preferences.styles?.length) parts.push(`likes ${preferences.styles.join(", ")}`);
  return parts.length ? `Customer profile: ${parts.join("; ")}.` : "";
}
