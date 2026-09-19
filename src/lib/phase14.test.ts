import { describe, expect, it } from "vitest";
import { buildPrintPackage } from "@/lib/fulfillment/print-package";
import {
  buildDualCartPlacement,
  designIdsFromPlacement,
  formatPrintLabel,
  parseDualCartPlacement,
  primaryDesignIdFromPlacement,
  serializeDualCartPlacement,
} from "@/lib/catalog/display";
import { parseStylePreferences, parseStyleSizes, styleContextNote } from "@/lib/style-profile";
import { normalizeProductCategory } from "@/lib/product-categories";
import { checkRateLimit } from "@/lib/rate-limit";

describe("print package", () => {
  it("builds vendor-ready JSON with placement", () => {
    const pkg = buildPrintPackage({
      id: "o1",
      orderNumber: "PR-1",
      status: "ASSIGNED",
      shippingName: "Ayesha",
      shippingPhone: "0300",
      shippingCity: "Lahore",
      shippingAddress: "Canal",
      shippingProvince: "Punjab",
      advanceAmount: 0,
      remainingAmount: 1500,
      currency: "PKR",
      items: [
        {
          id: "i1",
          title: "Tee",
          size: "M",
          color: "Charcoal Grey",
          quantity: 1,
          placementJson: '{"side":"front","x":0.5}',
          product: { name: "Essential Tee", category: "T_SHIRT" },
          design: { title: "Grid", imageUrl: "/designs/x.svg" },
        },
      ],
      vendor: { businessName: "Print Hub", city: "Faisalabad", phone: "0311" },
      shipments: [{ carrier: "Print Hub courier", trackingNumber: null, status: "awaiting_production" }],
    } as never);

    expect(pkg.version).toBe(1);
    expect(pkg.items[0]?.designTitle).toBe("Grid");
    expect(pkg.items[0]?.placement).toMatchObject({ side: "front" });
  });
});

describe("dual cart placement", () => {
  it("parses legacy and dual shapes", () => {
    const legacy = parseDualCartPlacement('{"side":"back","x":0.4,"y":0.3,"scale":1.2,"rotation":0}');
    expect(legacy.side).toBe("back");
    expect(legacy.front).toBeUndefined();
    expect(legacy.back).toBeUndefined();

    const dual = parseDualCartPlacement({
      side: "front",
      x: 0.5,
      y: 0.4,
      scale: 1,
      rotation: 0,
      front: { designId: "d1", x: 0.5, y: 0.34, scale: 1, rotation: 0 },
      back: { designId: "d2", x: 0.5, y: 0.3, scale: 1.1, rotation: 0 },
    });
    expect(designIdsFromPlacement(dual)).toEqual(["d1", "d2"]);
    expect(primaryDesignIdFromPlacement(dual)).toBe("d1");
    expect(formatPrintLabel(JSON.stringify(dual), { id: "d1", title: "Alpha" }, { d2: "Beta" })).toBe(
      "Front · Alpha · Back · Beta",
    );
  });

  it("builds dual payload with blank side", () => {
    const built = buildDualCartPlacement({
      front: {
        side: "front",
        designId: "d1",
        x: 0.5,
        y: 0.34,
        scale: 1,
        rotation: 0,
      },
      back: null,
      activeSide: "front",
    });
    expect(built.front?.designId).toBe("d1");
    expect(built.back).toBeNull();
    const json = serializeDualCartPlacement(built);
    expect(json).toContain('"back":null');
    expect(primaryDesignIdFromPlacement(parseDualCartPlacement(json))).toBe("d1");
  });
});

describe("style profile helpers", () => {
  it("parses preferences and builds consultant note", () => {
    const prefs = parseStylePreferences(
      JSON.stringify({ fit: "oversized", styles: ["Minimal"] }),
    );
    const sizes = parseStyleSizes(JSON.stringify({ default: "L" }));
    expect(prefs.fit).toBe("oversized");
    expect(styleContextNote(prefs, sizes)).toContain("preferred size L");
  });
});

describe("product category normalize", () => {
  it("accepts enum and label", () => {
    expect(normalizeProductCategory("hoodie")).toBe("HOODIE");
    expect(normalizeProductCategory("HOODIE")).toBe("HOODIE");
    expect(normalizeProductCategory("Hoodie")).toBe("HOODIE");
    expect(normalizeProductCategory("nope")).toBeNull();
  });
});

describe("rate limit", () => {
  it("blocks after limit", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60_000).ok).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).ok).toBe(true);
    expect(checkRateLimit(key, 2, 60_000).ok).toBe(false);
  });
});
