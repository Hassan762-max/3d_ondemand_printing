/**
 * Lightweight in-memory rate limit for sensitive server actions.
 * Resets on process restart — swap for Redis in multi-instance production.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true };
}
