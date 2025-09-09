import type { NextConfig } from "next";

const nextConfig: NextConfig & { logging?: { level?: 'verbose' | 'info' | 'warn' | 'error' } } = {
  images: {
    domains: [], // Empty array allows all domains (legacy format)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  logging: { level: 'error' },
};

export default nextConfig;