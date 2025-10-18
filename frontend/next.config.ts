import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Configure image optimization
  images: {
    domains: [],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    return config;
  },
  
  // Configure TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable static exports for now
  output: 'standalone',
};

export default nextConfig;
