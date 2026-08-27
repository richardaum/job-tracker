import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { getAllowedDevOrigins } from "./config/dev-network";
import { screenshotFlags, screenshotsEnabled } from "./src/lib/screenshot-flags";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const buildTimestamp = new Date().toISOString();

const nextConfig: NextConfig = {
  env: { NEXT_DEPLOYED_AT: buildTimestamp },
  // Proxy the API same-origin so the Better Auth session cookie is usable by both
  // /api/auth and /graphql. Web and API live on different registrable domains, and
  // browsers (Firefox Total Cookie Protection, Safari ITP) partition cookies set via
  // a cross-site fetch during the OAuth redirect dance, breaking the state cookie.
  async rewrites() {
    if (!apiOrigin) return [];

    return [
      { source: "/api/:path*", destination: `${apiOrigin}/api/:path*` },
      { source: "/graphql", destination: `${apiOrigin}/graphql` },
    ];
  },
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
  devIndicators: screenshotsEnabled && screenshotFlags.hideNextDevIndicator ? false : undefined,
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
