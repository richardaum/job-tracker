import { RsdoctorWebpackPlugin } from "@rsdoctor/webpack-plugin";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { getAllowedDevOrigins } from "./config/dev-network";

const isRsdoctorEnabled = false;

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
    return rewrites;
  },
  serverExternalPackages: ["pdfjs-dist"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    }

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
