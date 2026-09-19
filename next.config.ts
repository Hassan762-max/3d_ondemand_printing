import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  // Allow ngrok tunnels to load Next.js client router assets in development.
  // Without this, Link navigations degrade to full document reloads over ngrok.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.io"],
  experimental: {
    // Match upload helpers (5MB photos) with headroom for multipart overhead.
    serverActions: {
      bodySizeLimit: "6mb",
    },
    proxyClientMaxBodySize: "6mb",
    // Keep recent portal RSC payloads on the client so sidebar nav feels instant.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async headers() {
    const headers = [...securityHeaders];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers }];
  },
  async redirects() {
    return [
      { source: "/marketplace", destination: "/designs", permanent: false },
      { source: "/marketplace/:path*", destination: "/designs", permanent: false },
      // Typo / Auth.js underscore variants → real page
      { source: "/auth/sign_in", destination: "/auth/sign-in", permanent: false },
      { source: "/auth/signin", destination: "/auth/sign-in", permanent: false },
    ];
  },
};

export default nextConfig;
