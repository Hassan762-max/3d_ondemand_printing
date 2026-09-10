import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  async redirects() {
    return [
      { source: "/marketplace", destination: "/designs", permanent: false },
      { source: "/marketplace/:path*", destination: "/designs", permanent: false },
    ];
  },
};

export default nextConfig;
