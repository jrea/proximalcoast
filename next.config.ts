import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
