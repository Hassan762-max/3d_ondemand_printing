import { describe, expect, it } from "vitest";
import {
  CHARCOAL_GREY_HEX,
  catalogColorAliases,
  catalogColorHex,
  catalogColorLabel,
  catalogColorOption,
  catalogDisplayName,
  catalogProductWhere,
  categoriesForGroup,
  isHiddenCatalogSlug,
  normalizeCatalogGroup,
  normalizeCatalogSort,
} from "@/lib/catalog/display";
import {
  normalizeProductCategory,
  productCategoryLabel,
} from "@/lib/product-categories";

describe("catalog color aliases — Black ↔ Charcoal Grey", () => {
  it("labels Black as Charcoal Grey with soft charcoal hex", () => {
    expect(catalogColorLabel("Black")).toBe("Charcoal Grey");
    expect(catalogColorLabel("Navy")).toBe("Navy");
    expect(catalogColorHex("Black", "#000000")).toBe(CHARCOAL_GREY_HEX);
    expect(catalogColorHex("Charcoal Grey", "#111111")).toBe(CHARCOAL_GREY_HEX);
    expect(catalogColorOption("Black", "#000000")).toEqual({
      name: "Charcoal Grey",
      hex: CHARCOAL_GREY_HEX,
    });
  });

  it("matches cart/try-on colors against both Black and Charcoal Grey", () => {
    expect(catalogColorAliases("Black")).toEqual(["Charcoal Grey", "Black"]);
    expect(catalogColorAliases("Charcoal Grey")).toEqual([
      "Charcoal Grey",
      "Black",
    ]);
    expect(catalogColorAliases("White")).toEqual(["White"]);
  });
});

describe("hidden catalog slugs", () => {
  it("flags retired products and excludes them from storefront where clauses", () => {
    expect(isHiddenCatalogSlug("studio-joggers")).toBe(true);
    expect(isHiddenCatalogSlug("essential-tee")).toBe(false);
    const where = catalogProductWhere({ category: "T_SHIRT" });
    expect(where.active).toBe(true);
    expect(where.category).toBe("T_SHIRT");
    expect(where.slug).toEqual({
      notIn: expect.arrayContaining(["studio-joggers", "court-shorts"]),
    });
  });
});

describe("catalog display helpers", () => {
  it("maps slugs to short fashion names", () => {
    expect(catalogDisplayName("monsoon-hoodie", "Monsoon Hoodie")).toBe("Hoodie");
    expect(catalogDisplayName("unknown-slug", "Essential Tee")).toBe("Tee");
  });

  it("normalizes group and sort query params safely", () => {
    expect(normalizeCatalogGroup("hoodies")).toBe("hoodies");
    expect(normalizeCatalogGroup("nope")).toBe("all");
    expect(normalizeCatalogSort("price-asc")).toBe("price");
    expect(normalizeCatalogSort("price-desc")).toBe("price-desc");
    expect(normalizeCatalogSort("weird")).toBe("popular");
    expect(categoriesForGroup("tshirts")).toEqual(["T_SHIRT", "OVERSIZED_T_SHIRT"]);
    expect(categoriesForGroup("all")).toBeNull();
  });
});

describe("product categories", () => {
  it("labels and normalizes category values", () => {
    expect(productCategoryLabel("HOODIE")).toBe("Hoodie");
    expect(productCategoryLabel("UNKNOWN")).toBe("UNKNOWN");
    expect(normalizeProductCategory("hoodie")).toBe("HOODIE");
    expect(normalizeProductCategory("Drop Shoulder")).toBe("OVERSIZED_T_SHIRT");
    expect(normalizeProductCategory("nope")).toBeNull();
  });
});
