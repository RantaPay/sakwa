import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  transpilePackages: [
    "@sakwa/ui",
    "@sakwa/types",
    "@sakwa/utils",
    "@sakwa/validators",
    "@sakwa/emails",
  ],
};

export default withSerwist(nextConfig);
