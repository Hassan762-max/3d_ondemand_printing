import { describe, expect, it } from "vitest";
import { canVendorTransition } from "@/lib/vendor/status-transitions";
import {
  customerStatusNotification,
  generateVendorTrackingNumber,
  resolveTrackingNumber,
  vendorCityPrefix,
} from "@/lib/vendor/tracking";

describe("vendorCityPrefix + generateVendorTrackingNumber", () => {
  it("maps known cities and falls back to PK", () => {
    expect(vendorCityPrefix("Lahore")).toBe("LHE");
    expect(vendorCityPrefix("Karachi")).toBe("KHI");
    expect(vendorCityPrefix("Unknown Town")).toBe("PK");
  });

  it("builds PK-{city}-{orderPart} tracking ids", () => {
    expect(
      generateVendorTrackingNumber({
        orderNumber: "PR-20260913-4215",
        vendorCity: "Lahore",
      }),
    ).toBe("PK-LHE-20260913-4215");
  });
});

describe("resolveTrackingNumber", () => {
  it("keeps an existing shipment tracking number", () => {
    expect(
      resolveTrackingNumber({
        existing: "PK-LHE-EXISTING",
        fromForm: "PK-LHE-FROM-FORM",
        orderNumber: "PR-20260913-4215",
        vendorCity: "Lahore",
      }),
    ).toBe("PK-LHE-EXISTING");
  });

  it("accepts a valid form override and rejects placeholders", () => {
    expect(
      resolveTrackingNumber({
        existing: null,
        fromForm: "CUSTOM-TRACK-99",
        orderNumber: "PR-20260913-4215",
        vendorCity: "Lahore",
      }),
    ).toBe("CUSTOM-TRACK-99");

    expect(
      resolveTrackingNumber({
        existing: null,
        fromForm: "PK-...",
        orderNumber: "PR-20260913-4215",
        vendorCity: "Islamabad",
      }),
    ).toBe("PK-ISB-20260913-4215");
  });
});

describe("customerStatusNotification", () => {
  it("includes tracking and COD reminder for out-for-delivery", () => {
    const note = customerStatusNotification({
      orderNumber: "PR-20260913-4215",
      status: "OUT_FOR_DELIVERY",
      trackingNumber: "PK-LHE-20260913-4215",
    });
    expect(note.title).toBe("Out for delivery");
    expect(note.body).toMatch(/Tracking PK-LHE-20260913-4215/);
    expect(note.body).toMatch(/COD/);
  });

  it("marks delivered orders as completed", () => {
    const note = customerStatusNotification({
      orderNumber: "PR-20260913-4215",
      status: "DELIVERED",
      trackingNumber: "PK-LHE-20260913-4215",
    });
    expect(note.title).toBe("Order completed");
    expect(note.body).toMatch(/delivered/i);
  });
});

describe("canVendorTransition — production path", () => {
  it("allows ASSIGNED → IN_PRODUCTION only", () => {
    expect(canVendorTransition("ASSIGNED", "IN_PRODUCTION")).toBe(true);
    expect(canVendorTransition("ASSIGNED", "DELIVERED")).toBe(false);
    expect(canVendorTransition("ASSIGNED", "SHIPPED")).toBe(false);
  });

  it("allows QC ↔ production and ship from QC", () => {
    expect(canVendorTransition("IN_PRODUCTION", "QC")).toBe(true);
    expect(canVendorTransition("QC", "IN_PRODUCTION")).toBe(true);
    expect(canVendorTransition("QC", "SHIPPED")).toBe(true);
    expect(canVendorTransition("QC", "DELIVERED")).toBe(false);
  });

  it("requires courier steps before delivery", () => {
    expect(canVendorTransition("SHIPPED", "OUT_FOR_DELIVERY")).toBe(true);
    expect(canVendorTransition("SHIPPED", "DELIVERED")).toBe(true);
    expect(canVendorTransition("OUT_FOR_DELIVERY", "DELIVERED")).toBe(true);
    expect(canVendorTransition("DELIVERED", "SHIPPED")).toBe(false);
  });
});
