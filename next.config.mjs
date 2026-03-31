/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: ".",
  },
  outputFileTracingIncludes: {
    "/api/questions/random": ["./data/questions/**"],
    "/api/categories": ["./data/questions/**"],
    "/dashboard": ["./data/questions/**"],
    "/story-mode": ["./data/story-mode.json"],
  },
};

export default nextConfig;
