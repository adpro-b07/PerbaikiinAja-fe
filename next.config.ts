/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
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