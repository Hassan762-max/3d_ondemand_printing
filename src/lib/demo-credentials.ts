/**
 * Client-safe flag for demo login hints in the UI.
 *
 * Always false: seed/test accounts may still exist in local DBs, but passwords
 * and emails must never be rendered on customer-facing pages (including local
 * `next dev`). Do not re-enable via NEXT_PUBLIC_ALLOW_DEMO_CREDENTIALS.
 */
export const SHOW_DEMO_CREDENTIALS = false;
