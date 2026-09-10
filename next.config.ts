import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  experimental: {
    // Match upload helpers (5MB photos) with headroom for multipart overhead.
    serverActions: {
      bodySizeLimit: "6mb",
    },
    proxyClientMaxBodySize: "6mb",
  },
  async redirects() {
    return [
      { source: "/marketplace", destination: "/designs", permanent: false },
      { source: "/marketplace/:path*", destination: "/designs", permanent: false },
    ];
  },
};

export default nextConfig;
