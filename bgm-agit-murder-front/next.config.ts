import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  basePath: '/murder',
  assetPrefix: '/murder',

  async rewrites() {
    return [
      {
        source: '/bgm-agit/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/bgm-agit/:path*`,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
