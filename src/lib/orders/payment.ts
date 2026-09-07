/**
 * Payment adapter — hybrid advance + COD today,
 * ready for JazzCash / Easypaisa / card gateways later.
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

/** Placeholder for future full online checkout. */
export class FutureOnlineProvider implements PaymentProvider {
  readonly name = "ONLINE_GATEWAY";

  async capture(input: PaymentCaptureInput): Promise<PaymentCaptureResult> {
    return {
      ok: false,
      provider: this.name,
      reference: "",
      status: "FAILED",
      message: `Online gateway not configured for ${input.kind}. Use COD_HYBRID for now.`,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const mode = (process.env.PAYMENT_PROVIDER ?? "cod_hybrid").toLowerCase();
  if (mode === "online" || mode === "jazzcash" || mode === "easypaisa") {
    return new FutureOnlineProvider();
  }
  return new HybridCodProvider();
}
