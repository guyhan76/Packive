import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
  experimental: {
    turbo: undefined,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
=======
  /* Use Webpack bundler (Turbopack needs Node 22+) */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
>>>>>>> d598974bb7ff893ba305849ca9615f97656ec914
};

export default nextConfig;