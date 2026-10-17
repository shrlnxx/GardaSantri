import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Enable server external packages for native node:sqlite
  serverExternalPackages: ["node:sqlite"],
};

export default nextConfig;
