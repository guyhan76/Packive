import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Use Webpack bundler (Turbopack needs Node 22+) */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
