import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  devIndicators: false,
  output: 'export',
  basePath: process.env.VERCEL === '1' ? undefined : '/therapist',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
