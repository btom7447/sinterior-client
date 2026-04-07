import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the X-Powered-By: Next.js header (small fingerprinting reduction)
  poweredByHeader: false,

  // Enable gzip compression for HTML/JSON responses
  compress: true,

  // Best Practices: use React strict mode to catch side-effect bugs
  reactStrictMode: true,

  images: {
    // Modern image formats — Lighthouse rewards these heavily
    formats: ["image/avif", "image/webp"],
    // Longer minimum TTL for CDN-cached optimized images
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      // Allow backend-served uploads (product photos, avatars, etc) so the
      // Next.js image optimizer can resize/format them instead of serving
      // raw bytes. Covers both local dev and Render deployment.
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "sinterior-server.onrender.com" },
    ],
  },

  // Security headers for Lighthouse "Best Practices" audits
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
