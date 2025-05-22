/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "images.unsplash.com",
      "public-files.gumroad.com",
      "gumroad.com",
      "gumroadfiles.com",
      "cdn.hashnode.com",
      "hashnode.com",
      "res.cloudinary.com",
      "avatars.githubusercontent.com",
      "github.com",
      "raw.githubusercontent.com",
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
