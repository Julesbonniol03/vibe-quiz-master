/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/questions/random": ["./data/questions/**"],
      "/api/categories": ["./data/questions/**"],
      "/dashboard": ["./data/questions/**"],
    },
  },
};

export default nextConfig;
