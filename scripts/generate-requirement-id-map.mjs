#!/usr/bin/env node
/**
 * Writes `packages/ui/src/stories/requirement-id-map.generated.json`:
 * each traceability id (`P-1`, `T-57`, `H-64`, …) → repo-relative path of the
 * Markdown file whose **list-item definition** (`- [X-NNN]`) is the canonical
 * home for that id (used to turn bare `[X-NNN]` into Storybook doc links).
 *
 * Priority: `specs/<NNN-slug>/README.md` (sorted), then `specs/HISTORY.md`,
 * then other Markdown under `specs/` (excluding `specs/INDEX.md`).
 */

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

/**
 * @returns {string[]}
 */
function listSpecMarkdownRelPaths() {
  /** @type {string[]} */
  const out = [];
  function walk(currentAbs) {
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

/**
 * @param {string} posix
 * @returns {number}
 */
function pathTier(posix) {
  if (posix === "specs/HISTORY.md") {
    return 1;
  }
  if (/^specs\/\d{3}-[a-z0-9-]+\/README\.md$/.test(posix)) {
    return 0;
  }
  return 2;
}

/**
 * @returns {Record<string, string>}
 */
function buildMap() {
  /** @type {Map<string, { path: string, tier: number }>} */
  const best = new Map();

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

  /** @type {Record<string, string>} */
  const out = {};
  for (const [id, { path: p }] of best) {
    out[id] = p;
  }
  const keys = Object.keys(out).sort();
  /** @type {Record<string, string>} */
  const sorted = {};
  for (const k of keys) {
    sorted[k] = out[k];
  }
  return sorted;
}

const CHECK_FLAG = "--check";

function main() {
  const check = process.argv.includes(CHECK_FLAG);
  const map = buildMap();
  const body = JSON.stringify(map, null, 2) + "\n";

  if (check) {
    const abs = OUTPUT;
    if (!fs.existsSync(abs)) {
      console.error(
        `${path.relative(repoRoot, abs)} missing. Run: node scripts/generate-requirement-id-map.mjs`,
      );
      process.exit(1);
    }
    const actual = fs.readFileSync(abs, "utf8");
    if (actual !== body) {
      console.error(
        `${path.relative(repoRoot, abs)} is out of date. Run: node scripts/generate-requirement-id-map.mjs`,
      );
      process.exit(1);
    }
    process.exit(0);
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  let prev = "";
  try {
    prev = fs.readFileSync(OUTPUT, "utf8");
  } catch {
    // missing
  }
  if (prev !== body) {
    fs.writeFileSync(OUTPUT, body, "utf8");
    console.warn(
      `Updated ${path.relative(repoRoot, OUTPUT)} (${Object.keys(map).length} ids)`,
    );
  }
}

main();
