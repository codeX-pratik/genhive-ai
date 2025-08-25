import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [], // Empty array allows all domains (legacy format)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;