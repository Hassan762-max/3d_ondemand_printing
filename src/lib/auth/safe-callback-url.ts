/** Only allow same-origin relative redirects (e.g. /checkout). */
export function safeCallbackUrl(
  raw: FormDataEntryValue | string | null | undefined,
  fallback: string,
) {
  const value = String(raw ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  return value;
}
