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
      },
      {
        protocol: 'https',
        hostname: 'caimax-bucket.s3.eu-north-1.amazonaws.com'
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
