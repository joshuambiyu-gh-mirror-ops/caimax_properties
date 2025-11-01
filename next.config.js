/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['caimax-bucket.s3.eu-north-1.amazonaws.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'caimax-bucket.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|gif)$/i,
      type: 'asset/resource'
    })
    return config
  }
}

module.exports = nextConfig