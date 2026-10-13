import type { NextConfig } from "next";

/**
 * Baseline security headers for EVERY response. Previously the only
 * place that set any was the proxy's unknown-host 404 — normal pages
 * and API responses shipped with none of them. A full Content-Security-
 * Policy is deliberately NOT imposed here: the subsites embed third-
 * party content and use inline styles extensively, so CSP needs a
 * per-site rollout; frame-ancestors is covered via X-Frame-Options.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "bkd.lvh.me",
    "jerkstore.lvh.me",
    "bkd.localhost",
    "jerkstore.localhost",
    "localhost",
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
