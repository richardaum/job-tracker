import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { getAllowedDevOrigins } from "./config/dev-network";
import { screenshotFlags } from "./src/lib/screenshot-flags";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      "job-tracker-web-eta.vercel.app",
      "job-tracker-web-richardaums-projects.vercel.app",
      "job-tracker-web-git-main-richardaums-projects.vercel.app",
    ].map((value) => ({
      source: "/:path*",
      destination: "https://newjobtracker.app/:path*",
      permanent: true,
      has: [{ type: "host", value }],
    }));
  },
  devIndicators: screenshotFlags.hideNextDevIndicator ? false : undefined,
  typedRoutes: true,
  experimental: { strictRouteTypes: true },
  // Keep separate dist dirs so `next build` does not conflict with a running `next dev`.
  // Side effect: Next rewrites `next-env.d.ts`; this file is treated as generated output.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: { remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }] },
  allowedDevOrigins: getAllowedDevOrigins(),
  serverExternalPackages: ["pdfjs-dist"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    }

    return config;
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  telemetry: false,
  webpack: { reactComponentAnnotation: { enabled: true } },
  _experimental: { turbopackReactComponentAnnotation: { enabled: true } },
});
