#!/usr/bin/env node
/**
 * Rasterizes apps/web/src/app/icon.svg → apps/extension/assets/icon{16,32,48,64,128,512}.png (Plasmo).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.resolve(__dirname, "..");
const svgPath = path.resolve(extRoot, "../web/src/app/icon.svg");

if (!fs.existsSync(svgPath)) {
  console.error(`Missing canonical web icon SVG: ${svgPath}`);
  process.exit(1);
}

const svg = fs.readFileSync(svgPath);
const outDir = path.join(extRoot, "assets");
fs.mkdirSync(outDir, { recursive: true });

const sizes = [16, 32, 48, 64, 128, 512];

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, `icon${size}.png`));
}

console.info(
  `Rendered ${sizes.length} icons from ../web/src/app/icon.svg → assets/`,
);
