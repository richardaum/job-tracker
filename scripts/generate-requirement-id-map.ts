#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const specsDir = path.join(repoRoot, "specs");
const OUTPUT = path.join(
  repoRoot,
  "packages/ui/src/stories/requirement-id-map.generated.json",
);

const DEF_LINE = /^\s*-\s*\[(P|T|R|H|F)-(\d+)\]/;
const SKIP = new Set(["specs/INDEX.md"]);

function listSpecMarkdownRelPaths(): string[] {
  const out: string[] = [];
  function walk(currentAbs: string): void {
    for (const ent of fs.readdirSync(currentAbs, { withFileTypes: true })) {
      const abs = path.join(currentAbs, ent.name);
      if (ent.isDirectory()) {
        walk(abs);
      } else if (ent.isFile() && ent.name.endsWith(".md")) {
        const posix = path.relative(repoRoot, abs).split(path.sep).join("/");
        if (!posix.startsWith("specs/") || SKIP.has(posix)) {
          continue;
        }
        out.push(posix);
      }
    }
  }
  walk(specsDir);
  out.sort();
  return out;
}

function pathTier(posix: string): number {
  if (posix === "specs/HISTORY.md") {
    return 1;
  }
  if (/^specs\/\d{3}-[a-z0-9-]+\/README\.md$/.test(posix)) {
    return 0;
  }
  return 2;
}

function buildMap(): Record<string, string> {
  const best = new Map<string, { path: string; tier: number }>();

  for (const posix of listSpecMarkdownRelPaths()) {
    const abs = path.join(repoRoot, posix);
    const text = fs.readFileSync(abs, "utf8");
    const tier = pathTier(posix);
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(DEF_LINE);
      if (!m) {
        continue;
      }
      const id = `${m[1]}-${m[2]}`;
      const prev = best.get(id);
      if (
        !prev ||
        tier < prev.tier ||
        (tier === prev.tier && posix < prev.path)
      ) {
        best.set(id, { path: posix, tier });
      }
    }
  }

  const sorted: Record<string, string> = {};
  const keys = [...best.keys()].sort();
  for (const k of keys) {
    sorted[k] = best.get(k)!.path;
  }
  return sorted;
}

const CHECK_FLAG = "--check";

function main(): void {
  const check = process.argv.includes(CHECK_FLAG);
  const map = buildMap();
  const body = JSON.stringify(map, null, 2) + "\n";

  if (check) {
    const abs = OUTPUT;
    if (!fs.existsSync(abs)) {
      console.error(
        `${path.relative(repoRoot, abs)} missing. Run: node --experimental-strip-types scripts/generate-requirement-id-map.ts`,
      );
      process.exit(1);
    }
    const actual = fs.readFileSync(abs, "utf8");
    if (actual !== body) {
      console.error(
        `${path.relative(repoRoot, abs)} is out of date. Run: node --experimental-strip-types scripts/generate-requirement-id-map.ts`,
      );
      process.exit(1);
    }
    process.exit(0);
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const prev = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : "";
  if (prev !== body) {
    fs.writeFileSync(OUTPUT, body, "utf8");
    console.warn(
      `Updated ${path.relative(repoRoot, OUTPUT)} (${Object.keys(map).length} ids)`,
    );
  }
}

main();
