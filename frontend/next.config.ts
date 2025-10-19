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
  
  // Add rewrites for API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
