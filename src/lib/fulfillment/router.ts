import type { ProductCategory, Vendor } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  capacityScore,
  costScore,
  locationScore,
} from "@/lib/fulfillment/scoring";

export type VendorScoreBreakdown = {
  vendorId: string;
  businessName: string;
  city: string;
  score: number;
  locationScore: number;
  costScore: number;
  capacityScore: number;
  qualityScore: number;
  deliveryScore: number;
  capabilityMatch: boolean;
  reasons: string[];
};

export async function scoreVendorsForOrder(input: {
  customerCity: string;
  categories: ProductCategory[];
  units: number;
}): Promise<VendorScoreBreakdown[]> {
  const vendors = await prisma.vendor.findMany({
    where: { active: true },
    include: { capabilities: true },
  });

  const openGroups = await prisma.order.groupBy({
    by: ["vendorId"],
    where: {
      vendorId: { not: null },
      status: { in: ["ASSIGNED", "IN_PRODUCTION", "QC"] },
    },
    _count: { _all: true },
  });
  const openByVendor = new Map(
    openGroups
      .filter((g) => g.vendorId)
      .map((g) => [g.vendorId as string, g._count._all]),
  );

  const scored = vendors.map((vendor) => {
    const caps = new Set(vendor.capabilities.map((c) => c.category));
    const capabilityMatch = input.categories.every((c) => caps.has(c));
    const openOrders = openByVendor.get(vendor.id) ?? 0;

    const loc = locationScore(input.customerCity, vendor.city);
    const cost = costScore(vendor.baseCostFactor);
    const capacity = capacityScore(openOrders, vendor.capacityDaily);
    const quality =
      (vendor.qualityScore / 5) * 0.5 +
      (vendor.rating / 5) * 0.3 +
      (1 - vendor.defectRate) * 0.1 +
      (1 - vendor.qcFailRate) * 0.1;
    const delivery =
      (vendor.deliveryScore / 5) * 0.7 + (1 - vendor.cancelRate) * 0.3;

    let score =
      loc * 0.28 +
      cost * 0.18 +
      capacity * 0.18 +
      quality * 0.22 +
      delivery * 0.14;

    const reasons: string[] = [];
    if (!capabilityMatch) {
      score *= 0.15;
      reasons.push("Missing required product capabilities");
    } else {
      reasons.push("Can produce all required categories");
    }
    if (loc >= 0.99) reasons.push("Same city as customer");
    else if (loc >= 0.7) reasons.push("Same region as customer");
    else reasons.push("Longer routing distance");

    if (vendor.baseCostFactor <= 1) reasons.push("Competitive production cost");
    if (capacity >= 0.6) reasons.push("Healthy open capacity");
    else reasons.push("Capacity under pressure");
    if (vendor.qualityScore >= 4) reasons.push("Strong quality score");
    if (vendor.deliveryScore >= 4) reasons.push("Reliable delivery performance");
    if (input.units > vendor.capacityDaily * 0.3) {
      score *= 0.92;
      reasons.push("Large order relative to daily capacity");
    }

    return {
      vendorId: vendor.id,
      businessName: vendor.businessName,
      city: vendor.city,
      score: Number(score.toFixed(4)),
      locationScore: Number(loc.toFixed(3)),
      costScore: Number(cost.toFixed(3)),
      capacityScore: Number(capacity.toFixed(3)),
      qualityScore: Number(quality.toFixed(3)),
      deliveryScore: Number(delivery.toFixed(3)),
      capabilityMatch,
      reasons,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

export async function selectBestVendor(input: {
  customerCity: string;
  categories: ProductCategory[];
  units: number;
}) {
  const ranked = await scoreVendorsForOrder(input);
  const best = ranked.find((v) => v.capabilityMatch) ?? ranked[0] ?? null;
  return { best, ranked };
}

export async function assignVendorToOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      assignments: true,
    },
  });
  if (!order) throw new Error("Order not found");
  if (order.vendorId && order.assignments.length > 0) {
    return { alreadyAssigned: true as const, order };
  }

  const categories = [
    ...new Set(order.items.map((i) => i.product.category)),
  ] as ProductCategory[];
  const units = order.items.reduce((sum, i) => sum + i.quantity, 0);

  const { best, ranked } = await selectBestVendor({
    customerCity: order.shippingCity,
    categories,
    units,
  });

  if (!best || !best.capabilityMatch) {
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: "Vendor matching delayed",
        body: `${order.orderNumber}: no capable vendor found yet. Ops will assign manually.`,
        href: `/orders/${order.id}`,
      },
    });
    return { alreadyAssigned: false as const, order, best: null, ranked };
  }

  const vendor = await prisma.vendor.findUniqueOrThrow({
    where: { id: best.vendorId },
  });
  const vendorCost = Math.round(order.subtotal * 0.58 * vendor.baseCostFactor);
  const platformMargin = Math.max(0, order.subtotal - vendorCost);

  const updated = await prisma.$transaction(async (tx) => {
    const assignment = await tx.fulfillmentAssignment.create({
      data: {
        orderId: order.id,
        vendorId: best.vendorId,
        score: best.score,
        reasonJson: JSON.stringify({
          best,
          alternatives: ranked.slice(0, 3),
        }),
      },
    });

    const next = await tx.order.update({
      where: { id: order.id },
      data: {
        vendorId: best.vendorId,
        status: "ASSIGNED",
        vendorCost,
        platformMargin,
      },
    });

    await tx.shipment.updateMany({
      where: { orderId: order.id },
      data: {
        carrier: `${best.businessName} courier`,
        status: "awaiting_production",
      },
    });

    await tx.notification.create({
      data: {
        userId: vendor.userId,
        title: "New production order",
        body: `${order.orderNumber} assigned · score ${best.score}`,
        href: `/vendor/orders/${order.id}`,
      },
    });

    await tx.notification.create({
      data: {
        userId: order.userId,
        title: "Vendor assigned",
        body: `${order.orderNumber} will be printed by ${best.businessName} (${best.city}).`,
        href: `/orders/${order.id}`,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "fulfillment.assign",
        entity: "Order",
        entityId: order.id,
        metaJson: JSON.stringify({ vendorId: best.vendorId, score: best.score }),
      },
    });

    return { next, assignment };
  });

  return {
    alreadyAssigned: false as const,
    order: updated.next,
    best,
    ranked,
    assignmentId: updated.assignment.id,
  };
}

export type { Vendor };
