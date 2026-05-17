import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: turbo 옵션은 experimental에서 제거됨. 빈 experimental 유지.
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} as NextConfig;

export default nextConfig;
