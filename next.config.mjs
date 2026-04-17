/** @type {import('next').NextConfig} */
const isCapacitor = process.env.CAPACITOR === "true";

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  ...(isCapacitor && {
    output: "export",
    images: { unoptimized: true },
  }),
  ...(!isCapacitor && {
    turbopack: { root: "." },
    outputFileTracingIncludes: {
      "/api/questions/random": ["./data/questions/**"],
      "/api/categories": ["./data/questions/**"],
      "/dashboard": ["./data/questions/**"],
      "/story-mode": ["./data/story-mode.json"],
      "/tour-du-monde": ["./data/tour-du-monde.json"],
    },
  }),
};

export default nextConfig;
