const nextConfig = {
  reactStrictMode: true,

  compiler: {
    styledComponents: true
  },

  basePath: '/record',
  assetPrefix: '/record',

  typescript: {
    ignoreBuildErrors: true,
  },

  // 서비스워커 범위를 '/record'(끝 슬래시 없음)까지 넓힌다. 파일 위치 기준 기본 범위 '/record/' 로는
  // 앱 첫 화면이 빠진다. source 는 basePath 기준이라 실제 주소는 /record/sw.js
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/record' },
          { key: 'Cache-Control', value: 'no-cache' },
        ],
      },
    ];
  },

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
