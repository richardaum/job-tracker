import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { RsdoctorWebpackPlugin } from "@rsdoctor/webpack-plugin";
import { getAllowedDevOrigins } from "./config/dev-network";

const isRsdoctorEnabled = false;
const isDevelopment = process.env.NODE_ENV === "development";
const debugIngestDestination = (() => {
  const apiGraphqlUrl = process.env.API_GRAPHQL_URL;
  if (!apiGraphqlUrl) return null;
  try {
    const ingestUrl = new URL(apiGraphqlUrl);
    ingestUrl.port = "7276";
    ingestUrl.pathname = "/ingest/1cbe7900-9129-4f3d-9396-0f3f448311ec";
    ingestUrl.search = "";
    ingestUrl.hash = "";
    return ingestUrl.toString();
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Keep separate dist dirs so `next build` does not conflict with a running `next dev`.
  // Side effect: Next rewrites `next-env.d.ts`; this file is treated as generated output.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  allowedDevOrigins: getAllowedDevOrigins(),
  async rewrites() {
    const rewrites = [
      { source: "/graphql", destination: "http://127.0.0.1:3101/graphql" },
      {
        source: "/auth/:path*",
        destination: "http://127.0.0.1:3101/auth/:path*",
      },
    ];
    if (isDevelopment && debugIngestDestination) {
      rewrites.push({
        source: "/__debug_ingest",
        destination: debugIngestDestination,
      });
    }
    return rewrites;
  },
  webpack: (config) => {
    if (!isRsdoctorEnabled) {
      return config;
    }

    const targetName = typeof config.name === "string" ? config.name : "client";

    config.plugins ??= [];
    config.plugins.push(
      new RsdoctorWebpackPlugin({
        disableClientServer: true,
        output: { reportDir: `./.rsdoctor/${targetName}` },
      }),
    );

    return config;
  },
};

export default withSentryConfig(nextConfig, { silent: true, telemetry: false });
