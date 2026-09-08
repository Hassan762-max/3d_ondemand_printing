import { describe, expect, it } from "vitest";
import { buildPrintPackage } from "@/lib/fulfillment/print-package";
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
      advanceAmount: 500,
      remainingAmount: 1500,
      currency: "PKR",
      items: [
        {
          id: "i1",
          title: "Tee",
          size: "M",
          color: "Black",
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
