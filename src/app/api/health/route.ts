import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FLAT_DELIVERY_FEE, DESIGN_SIDE_PRICE } from "@/lib/orders/pricing";
import { getAiProvider } from "@/lib/ai";
import { getPaymentProvider } from "@/lib/orders/payment";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let db: "up" | "down" = "down";

  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "up";
  } catch {
    db = "down";
  }

  const latencyMs = Date.now() - started;
  const isProd = process.env.NODE_ENV === "production";

  // Production: minimal surface for uptime probes (no provider / env leakage).
  if (isProd) {
    return NextResponse.json(
      {
        ok: db === "up",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: db === "up" ? 200 : 503 },
    );
  }

  return NextResponse.json(
    {
      ok: db === "up",
      service: "nivaro",
      db,
      ai: getAiProvider().name,
      payment: getPaymentProvider().name,
      deliveryFee: FLAT_DELIVERY_FEE,
      designSidePrice: DESIGN_SIDE_PRICE,
      nodeEnv: process.env.NODE_ENV ?? "development",
      latencyMs,
      timestamp: new Date().toISOString(),
    },
    { status: db === "up" ? 200 : 503 },
  );
}
