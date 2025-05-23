/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://perbaikiinaja.koyeb.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;