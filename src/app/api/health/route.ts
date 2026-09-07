import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

  const body = {
    ok: db === "up",
    service: "printora",
    db,
    ai: getAiProvider().name,
    payment: getPaymentProvider().name,
    advanceAmount: Number(process.env.NEXT_PUBLIC_ADVANCE_AMOUNT ?? 500),
    nodeEnv: process.env.NODE_ENV ?? "development",
    latencyMs: Date.now() - started,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: db === "up" ? 200 : 503 });
}
