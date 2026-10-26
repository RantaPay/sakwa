import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@sakwa/ui", "@sakwa/validators"],
};

export default nextConfig;
