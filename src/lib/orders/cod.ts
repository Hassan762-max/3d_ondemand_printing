/**
 * Pure helpers for ledger transitions at delivery time.
 * Used by vendor status updates and unit tests.
 */

export type LedgerLike = {
  kind: string;
  status: string;
  amount: number;
};

/** Returns true when a PENDING COD_REMAINING row should flip to COMPLETED. */
export function shouldCollectCodOnDelivery(nextStatus: string) {
  return nextStatus === "DELIVERED";
}

/**
 * Predict post-delivery COD ledger state for tests / finance previews.
 * Does not mutate — mirrors vendor delivery behavior.
 */
export function previewCodCollection(payments: LedgerLike[]): {
  collected: number;
  pendingBefore: number;
} {
  const pending = payments.filter(
    (p) => p.kind === "COD_REMAINING" && p.status === "PENDING",
  );
  const pendingBefore = pending.reduce((s, p) => s + p.amount, 0);
  return { collected: pendingBefore, pendingBefore };
}
