/**
 * Build a public-facing absolute URL for redirects.
 * Behind ngrok, Next sees http://localhost — use forwarded host/proto so
 * Location headers and cookies stay on the browser origin.
 */
export function sameOriginUrl(pathWithSearch: string, request: Request): URL {
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || request.headers.get("host") || "localhost:3000";
  const proto =
    forwardedProto === "http" || forwardedProto === "https"
      ? forwardedProto
      : host.includes("localhost") || host.startsWith("127.")
        ? "http"
        : "https";

  const base = `${proto}://${host}`;
  const url = new URL(pathWithSearch, base);

  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    url.protocol = "http:";
  }

  return url;
}
