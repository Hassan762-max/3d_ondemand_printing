/**
 * Launch smoke — pure domain checks without a running server.
 * Run: npx tsx scripts/phase11-smoke.ts
 */
import {
  FLAT_DELIVERY_FEE,
  computeOrderTotals,
  computeRefundAmount,
} from "../src/lib/orders/pricing";
import {
  previewCodCollection,
  shouldCollectCodOnDelivery,
} from "../src/lib/orders/cod";
import { canRequestReturn } from "../src/lib/ops/return-policy";
import { locationScore } from "../src/lib/fulfillment/scoring";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const totals = computeOrderTotals(500, "Lahore");
assert(totals.advanceAmount === 0, "no online advance");
assert(totals.deliveryFee === FLAT_DELIVERY_FEE, "flat delivery");
assert(totals.remainingAmount === 500 + FLAT_DELIVERY_FEE, "full COD");
assert(totals.totalPayable === totals.remainingAmount, "COD equals total");

assert(shouldCollectCodOnDelivery("DELIVERED"), "COD collect on deliver");
assert(!shouldCollectCodOnDelivery("SHIPPED"), "no COD collect on ship");

const preview = previewCodCollection([
  { kind: "COD_REMAINING", status: "PENDING", amount: 750 },
]);
assert(preview.collected === 750, "preview COD amount");

const refundPreDelivery = computeRefundAmount([
  { kind: "COD_REMAINING", status: "PENDING", amount: 750 },
]);
assert(refundPreDelivery === 0, "refund must not invent pending COD");

const policy = canRequestReturn({
  orderStatus: "DELIVERED",
  hasCustomDesign: true,
  deliveredAt: new Date(),
  reason: "changed_mind",
});
assert(!policy.ok, "custom change-of-mind must fail");

assert(locationScore("Lahore", "Lahore") === 1, "same-city score");
assert(locationScore("Lahore", "Faisalabad") === 0.72, "same-region score");

console.log("Phase 11 smoke OK — pricing, COD, returns, routing.");
