import { afterEach, describe, expect, it } from "vitest";
import {
  FutureOnlineProvider,
  HybridCodProvider,
  WalletLiveReadyProvider,
  getPaymentProvider,
} from "@/lib/orders/payment";

const ORIGINAL_PROVIDER = process.env.PAYMENT_PROVIDER;
const ORIGINAL_JC_ID = process.env.JAZZCASH_MERCHANT_ID;
const ORIGINAL_JC_PW = process.env.JAZZCASH_PASSWORD;
const ORIGINAL_EP_ID = process.env.EASYPAISA_STORE_ID;
const ORIGINAL_EP_PW = process.env.EASYPAISA_PASSWORD;

afterEach(() => {
  if (ORIGINAL_PROVIDER === undefined) delete process.env.PAYMENT_PROVIDER;
  else process.env.PAYMENT_PROVIDER = ORIGINAL_PROVIDER;

  if (ORIGINAL_JC_ID === undefined) delete process.env.JAZZCASH_MERCHANT_ID;
  else process.env.JAZZCASH_MERCHANT_ID = ORIGINAL_JC_ID;

  if (ORIGINAL_JC_PW === undefined) delete process.env.JAZZCASH_PASSWORD;
  else process.env.JAZZCASH_PASSWORD = ORIGINAL_JC_PW;

  if (ORIGINAL_EP_ID === undefined) delete process.env.EASYPAISA_STORE_ID;
  else process.env.EASYPAISA_STORE_ID = ORIGINAL_EP_ID;

  if (ORIGINAL_EP_PW === undefined) delete process.env.EASYPAISA_PASSWORD;
  else process.env.EASYPAISA_PASSWORD = ORIGINAL_EP_PW;
});

describe("HybridCodProvider", () => {
  it("completes a positive capture", async () => {
    const result = await new HybridCodProvider().capture({
      orderNumber: "PR-20260913-1234",
      amount: 500,
      kind: "ADVANCE",
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe("COMPLETED");
    expect(result.provider).toBe("COD_HYBRID");
    expect(result.reference).toMatch(/^COD-PR-20260913-1234-/);
  });

  it("fails when amount is zero or negative", async () => {
    const zero = await new HybridCodProvider().capture({
      orderNumber: "PR-20260913-1234",
      amount: 0,
      kind: "ADVANCE",
    });
    expect(zero.ok).toBe(false);
    expect(zero.status).toBe("FAILED");
  });
});

describe("WalletLiveReadyProvider", () => {
  it("simulates JazzCash when merchant keys are missing", async () => {
    delete process.env.JAZZCASH_MERCHANT_ID;
    delete process.env.JAZZCASH_PASSWORD;
    const result = await new WalletLiveReadyProvider("JAZZCASH").capture({
      orderNumber: "PR-20260913-9999",
      amount: 500,
      kind: "ADVANCE",
    });
    expect(result.ok).toBe(true);
    expect(result.provider).toBe("JAZZCASH");
    expect(result.reference).toMatch(/^JC-/);
    expect(result.message).toMatch(/simulated/i);
  });

  it("notes live-ready mode when JazzCash credentials exist", async () => {
    process.env.JAZZCASH_MERCHANT_ID = "merchant";
    process.env.JAZZCASH_PASSWORD = "secret";
    const result = await new WalletLiveReadyProvider("JAZZCASH").capture({
      orderNumber: "PR-20260913-9999",
      amount: 500,
      kind: "ADVANCE",
    });
    expect(result.message).toMatch(/merchant credentials detected/i);
  });

  it("uses EP reference prefix for Easypaisa", async () => {
    const result = await new WalletLiveReadyProvider("EASYPAISA").capture({
      orderNumber: "PR-20260913-1111",
      amount: 500,
      kind: "ADVANCE",
    });
    expect(result.reference).toMatch(/^EP-/);
  });
});

describe("FutureOnlineProvider + getPaymentProvider", () => {
  it("fails online gateway until a card PSP is wired", async () => {
    const result = await new FutureOnlineProvider().capture({
      orderNumber: "PR-20260913-0001",
      amount: 500,
      kind: "FULL_ONLINE",
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe("FAILED");
    expect(result.provider).toBe("ONLINE_GATEWAY");
  });

  it("selects providers from PAYMENT_PROVIDER env", () => {
    process.env.PAYMENT_PROVIDER = "jazzcash";
    expect(getPaymentProvider().name).toBe("JAZZCASH");

    process.env.PAYMENT_PROVIDER = "easypaisa";
    expect(getPaymentProvider().name).toBe("EASYPAISA");

    process.env.PAYMENT_PROVIDER = "online";
    expect(getPaymentProvider().name).toBe("ONLINE_GATEWAY");

    delete process.env.PAYMENT_PROVIDER;
    expect(getPaymentProvider().name).toBe("COD_HYBRID");
  });
});
