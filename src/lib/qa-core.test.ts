import { describe, expect, it } from "vitest";
import {
  capacityScore,
  costScore,
  locationScore,
  regionOf,
} from "@/lib/fulfillment/scoring";
import { trackingProgress } from "@/lib/orders/tracking";
import { checkRateLimit } from "@/lib/rate-limit";
import { formatPkr } from "@/lib/utils";

describe("vendor locationScore — routing matrix", () => {
  it("scores same city as 1", () => {
    expect(locationScore("Lahore", "lahore")).toBe(1);
  });

  it("scores same region lower than same city", () => {
    expect(regionOf("Lahore")).toBe("punjab_central");
    expect(regionOf("Faisalabad")).toBe("punjab_central");
    expect(locationScore("Lahore", "Faisalabad")).toBe(0.72);
  });

  it("scores distant cities at floor", () => {
    expect(locationScore("Karachi", "Peshawar")).toBe(0.2);
  });

  it("clamps capacity and cost scores to [0,1]", () => {
    expect(capacityScore(0, 100)).toBe(1);
    expect(capacityScore(200, 100)).toBe(0);
    expect(costScore(1)).toBe(1);
    expect(costScore(3)).toBe(0);
  });
});

describe("trackingProgress — status isolation", () => {
  it("marks cancelled / refunded timeline as cancelled", () => {
    const cancelled = trackingProgress("CANCELLED");
    expect(cancelled.every((s) => s.state === "cancelled")).toBe(true);
    const refunded = trackingProgress("REFUNDED");
    expect(refunded.every((s) => s.state === "cancelled")).toBe(true);
  });

  it("treats RETURN_REQUESTED as post-delivery progress", () => {
    const steps = trackingProgress("RETURN_REQUESTED");
    const delivered = steps.find((s) => s.key === "DELIVERED");
    expect(delivered?.state).toBe("done");
  });
});

describe("checkRateLimit", () => {
  it("allows burst then blocks", () => {
    const key = `qa-${Date.now()}`;
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, 3, 60_000).ok).toBe(true);
    }
    const blocked = checkRateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});

describe("formatPkr — density / overflow safety", () => {
  it("formats million-scale PKR without throwing", () => {
    const s = formatPkr(1_000_000);
    expect(s).toContain("1");
    expect(s.length).toBeGreaterThan(3);
  });

  it("falls back safely for NaN", () => {
    expect(formatPkr(Number.NaN)).toBe(formatPkr(0));
  });
});
