/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/honey/:slug',
        destination: '/api/honey/:slug',
      },
    ];
  },
};

module.exports = nextConfig;