import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'ik.imagekit.io'
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    }
  }
};

export default nextConfig;
