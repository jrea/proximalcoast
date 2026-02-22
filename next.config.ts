import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["hanko.lvh.me", "bkd.lvh.me", "jerkstore.lvh.me", "hanko.localhost", "bkd.localhost", "jerkstore.localhost", "localhost"],
  /* config options here */
  async redirects() {
    return [
      {
        source: "/jerkstore",
        destination: "https://jerkstore.proximalcoast.com",
        permanent: true,
      },
      {
        source: "/jerkstore/:path*",
        destination: "https://jerkstore.proximalcoast.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
