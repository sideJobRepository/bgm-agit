// next.config.ts

import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: "/bgm-agit/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL}/bgm-agit/:path*`,
            },
        ];
    },
};

export default nextConfig;
