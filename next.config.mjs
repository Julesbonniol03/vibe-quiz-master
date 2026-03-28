/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/questions/random": ["./data/questions/**"],
      "/api/categories": ["./data/questions/**"],
      "/dashboard": ["./data/questions/**"],
      "/aventure": ["./data/adventure.json"],
    },
  },
};

export default nextConfig;
