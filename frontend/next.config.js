/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "http", hostname: "localhost" }],
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
