/**
 * Launch smoke — pure domain checks without a running server.
 * Run: npx tsx scripts/phase11-smoke.ts
 */
import {
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

const totals = computeOrderTotals(2499, "Lahore");
assert(totals.advanceAmount === 500, "advance should be 500");
assert(totals.remainingAmount === 2199, "COD remainder mismatch");

assert(shouldCollectCodOnDelivery("DELIVERED"), "COD collect on deliver");
assert(!shouldCollectCodOnDelivery("SHIPPED"), "no COD collect on ship");

const preview = previewCodCollection([
  { kind: "ADVANCE", status: "COMPLETED", amount: 500 },
  { kind: "COD_REMAINING", status: "PENDING", amount: 2199 },
]);
assert(preview.collected === 2199, "preview COD amount");

const refundPreDelivery = computeRefundAmount([
  { kind: "ADVANCE", status: "COMPLETED", amount: 500 },
  { kind: "COD_REMAINING", status: "PENDING", amount: 2199 },
]);
assert(refundPreDelivery === 500, "refund must not invent pending COD");

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
