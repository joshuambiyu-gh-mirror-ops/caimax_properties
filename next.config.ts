import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/auth/signin',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
