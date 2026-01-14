
const nextConfig = {
  reactStrictMode: true,

  // /record 로 베이스 경로 지정
  basePath: '/record',
  assetPrefix: '/record',

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
