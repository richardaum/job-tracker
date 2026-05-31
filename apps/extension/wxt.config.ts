import fs from "node:fs";
import path from "node:path";

import { deriveSlug } from "@job-tracker/worktree-cli/derive-slug";
import react from "@vitejs/plugin-react";
import sharp from "sharp";
import { defineConfig } from "wxt";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const DEFAULT_API_URL = "http://localhost:3101";
const wxtDevPort = Number.parseInt(process.env.WXT_DEV_PORT ?? "3001", 10);
const worktreeSlug = deriveSlug(repoRoot);
const extensionDisplayName = worktreeSlug !== "job-tracker" ? `Job Tracker (${worktreeSlug})` : "Job Tracker";

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "../entrypoints",
  outDir: "build",
  outDirTemplate: "{{browser}}-mv{{manifestVersion}}{{modeSuffix}}",
  webExt: { disabled: true },
  dev: { server: { port: wxtDevPort } },
  manifest: (env) => ({
    name: extensionDisplayName,
    description: "Job Tracker browser extension (MV3).",
    permissions: ["cookies", "sidePanel", "scripting", "contextMenus", "windows"],
    host_permissions:
      env.command === "serve"
        ? ["<all_urls>"]
        : [
            "https://remoteyeah.com/*",
            "https://*.remoteyeah.com/*",
            toGraphqlHostPermissionPattern(`${process.env.WXT_PUBLIC_API_URL ?? DEFAULT_API_URL}/graphql`),
          ],
    content_security_policy:
      env.command === "serve"
        ? { extension_pages: `script-src 'self' 'wasm-unsafe-eval' http://localhost:${wxtDevPort}; object-src 'self'` }
        : undefined,
    icons: {
      16: "assets/icon16.png",
      32: "assets/icon32.png",
      48: "assets/icon48.png",
      64: "assets/icon64.png",
      128: "assets/icon128.png",
      512: "assets/icon512.png",
    },
    action: {
      default_icon: {
        16: "assets/icon16.png",
        32: "assets/icon32.png",
        48: "assets/icon48.png",
        64: "assets/icon64.png",
        128: "assets/icon128.png",
      },
    },
  }),
  vite: () => ({
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(import.meta.dirname, "src"), "@ui": path.join(repoRoot, "packages/ui/src") },
    },
    server: { fs: { allow: [repoRoot] } },
  }),
  hooks: {
    async "build:before"(wxt) {
      await renderIcons(wxt.config.root);
    },
  },
});

/** Rasterize `apps/web/src/app/icon.svg` → `public/assets/icon{16,…,512}.png` before each build. */
async function renderIcons(extRoot: string): Promise<void> {
  const svgPath = path.resolve(extRoot, "../web/src/app/icon.svg");
  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing canonical web icon SVG: ${svgPath}`);
  }
  const svg = fs.readFileSync(svgPath);
  const outDir = path.join(extRoot, "public/assets");
  fs.mkdirSync(outDir, { recursive: true });
  const sizes = [16, 32, 48, 64, 128, 512] as const;
  for (const size of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon${size}.png`));
  }
}

function toGraphqlHostPermissionPattern(graphqlUrl: string): string {
  try {
    return `${new URL(graphqlUrl).origin}/*`;
  } catch {
    return `${new URL(`${DEFAULT_API_URL}/graphql`).origin}/*`;
  }
}
