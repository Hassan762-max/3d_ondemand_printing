/**
 * Payment adapter — hybrid advance + COD today,
 * JazzCash / Easypaisa live-ready stubs for production wiring.
 */

export type PaymentCaptureInput = {
  orderNumber: string;
  amount: number;
  kind: "ADVANCE" | "FULL_ONLINE";
  customerPhone?: string;
};

export type PaymentCaptureResult = {
  ok: boolean;
  provider: string;
  reference: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  message?: string;
};

export interface PaymentProvider {
  readonly name: string;
  capture(input: PaymentCaptureInput): Promise<PaymentCaptureResult>;
}

/** Simulates collecting the Rs. 500 advance until a real gateway is wired. */
export class HybridCodProvider implements PaymentProvider {
  readonly name = "COD_HYBRID";

  async capture(input: PaymentCaptureInput): Promise<PaymentCaptureResult> {
    if (input.amount <= 0) {
      return {
        ok: false,
        provider: this.name,
        reference: "",
        status: "FAILED",
        message: "Invalid amount.",
      };
    }

    return {
      ok: true,
      provider: this.name,
      reference: `ADV-${input.orderNumber}-${Date.now().toString(36).toUpperCase()}`,
      status: "COMPLETED",
      message: "Advance recorded. Remaining amount due on delivery (COD).",
    };
  }
}

/**
 * Live-ready wallet providers — same UX shape as production JazzCash/Easypaisa.
 * Set JAZZCASH_* / EASYPAISA_* merchant keys when switching off simulation.
 */
export class WalletLiveReadyProvider implements PaymentProvider {
  constructor(private readonly wallet: "JAZZCASH" | "EASYPAISA") {}

  get name() {
    return this.wallet;
  }

  async capture(input: PaymentCaptureInput): Promise<PaymentCaptureResult> {
    if (input.amount <= 0) {
      return {
        ok: false,
        provider: this.name,
        reference: "",
        status: "FAILED",
        message: "Invalid amount.",
      };
    }

    const prefix = this.wallet === "JAZZCASH" ? "JC" : "EP";
    const configured =
      this.wallet === "JAZZCASH"
        ? Boolean(process.env.JAZZCASH_MERCHANT_ID && process.env.JAZZCASH_PASSWORD)
        : Boolean(process.env.EASYPAISA_STORE_ID && process.env.EASYPAISA_PASSWORD);

    return {
      ok: true,
      provider: this.name,
      reference: `${prefix}-${input.orderNumber}-${Date.now().toString(36).toUpperCase()}`,
      status: "COMPLETED",
      message: configured
        ? `${this.name} live-ready capture (merchant credentials detected — replace stub with real API).`
        : `${this.name} simulated advance capture. Remaining due on delivery (COD) unless FULL_ONLINE.`,
    };
  }
}

/** Explicit online-only mode until a card PSP is connected. */
export class FutureOnlineProvider implements PaymentProvider {
  readonly name = "ONLINE_GATEWAY";

  async capture(input: PaymentCaptureInput): Promise<PaymentCaptureResult> {
    return {
      ok: false,
      provider: this.name,
      reference: "",
      status: "FAILED",
      message: `Online card gateway not configured for ${input.kind}. Use COD_HYBRID, JAZZCASH, or EASYPAISA.`,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const mode = (process.env.PAYMENT_PROVIDER ?? "cod_hybrid").toLowerCase();
  if (mode === "jazzcash") return new WalletLiveReadyProvider("JAZZCASH");
  if (mode === "easypaisa") return new WalletLiveReadyProvider("EASYPAISA");
  if (mode === "online") return new FutureOnlineProvider();
  return new HybridCodProvider();
}
