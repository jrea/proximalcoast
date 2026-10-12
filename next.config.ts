import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "bkd.lvh.me",
    "jerkstore.lvh.me",
    "bkd.localhost",
    "jerkstore.localhost",
    "localhost",
  ],
};

export default nextConfig;
