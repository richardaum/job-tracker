import fs from "node:fs";
import path from "node:path";

import react from "@vitejs/plugin-react";
import sharp from "sharp";
import { defineConfig } from "wxt";

const repoRoot = path.resolve(import.meta.dirname, "../..");

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "../entrypoints",
  outDir: "build",
  outDirTemplate: "{{browser}}-mv{{manifestVersion}}{{modeSuffix}}",
  webExt: { disabled: true },
  manifest: (env) => ({
    name: "Job Tracker",
    description: "Job Tracker browser extension (MV3).",
    permissions: ["sidePanel", "scripting"],
    host_permissions:
      env.command === "serve"
        ? ["<all_urls>"]
        : ["https://remoteyeah.com/*", "https://*.remoteyeah.com/*"],
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
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@ui": path.join(repoRoot, "packages/ui/src"),
      },
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
