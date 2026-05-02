#!/usr/bin/env node
/**
 * Writes specs/INDEX.md — minimal YAML frontmatter: **`specCount`**, **`requirementIdCount`**, **`historyCount`**.
 *
 * Usage:
 *   node scripts/sync-spec-indices.mjs
 *   node scripts/sync-spec-indices.mjs --check
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { stringify as yamlStringify } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const specsDir = path.join(repoRoot, "specs");

const SCRIPT = "scripts/sync-spec-indices.mjs";
const CMD = "pnpm leanspec:sync-spec-indices";
const OUTPUT = "specs/INDEX.md";
const HISTORY_FILE = "specs/HISTORY.md";

const SPEC_DIR = /^\d{3}-/;
const TRACE_RE = /\[(P|T|R|H|F)-(\d+)\]/g;

const SKIP_REQ_SCAN = new Set([OUTPUT, "specs/README.md"]);

const CHECK_FLAG = "--check";

const FORMAT_VERSION = 1;

/** Deterministic YAML for frontmatter (`--check` stays stable across runs). */
function frontmatterYAML(doc) {
  return (
    "---\n" +
    yamlStringify(doc, {
      indent: 2,
      lineWidth: 0,
      defaultStringType: "QUOTE_DOUBLE",
      defaultKeyType: "PLAIN",
    }).trimEnd() +
    "\n---\n"
  );
}

function countSpecFolders() {
  if (!fs.existsSync(specsDir)) {
    return 0;
  }
  let n = 0;
  for (const name of fs.readdirSync(specsDir)) {
    if (!SPEC_DIR.test(name)) {
      continue;
    }
    const specRoot = path.join(specsDir, name);
    if (!fs.statSync(specRoot).isDirectory()) {
      continue;
    }
    if (!fs.existsSync(path.join(specRoot, "README.md"))) {
      continue;
    }
    n++;
  }
  return n;
}

/**
 * Paths relative to repo root — Markdown files under specs/ recursively.
 */
function listSpecMarkdownPaths() {
  /** @type {string[]} */
  const out = [];
  function walk(currentAbs) {
    for (const ent of fs.readdirSync(currentAbs, { withFileTypes: true })) {
      const abs = path.join(currentAbs, ent.name);
      if (ent.isDirectory()) {
        walk(abs);
      } else if (ent.isFile() && ent.name.endsWith(".md")) {
        const posix = path.relative(repoRoot, abs).split(path.sep).join("/");
        if (SKIP_REQ_SCAN.has(posix) || !posix.startsWith("specs/")) {
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

function countUniqueTraceabilityIds() {
  const seen = new Set();
  for (const posix of listSpecMarkdownPaths()) {
    const text = fs.readFileSync(path.join(repoRoot, posix), "utf8");
    TRACE_RE.lastIndex = 0;
    let match;
    while ((match = TRACE_RE.exec(text)) !== null) {
      seen.add(`${match[1]}-${match[2]}`);
    }
  }
  return seen.size;
}

/** Lines in `specs/HISTORY.md` that start a list item with `[H-NNN]` (chronicle entries). */
function countHistoryEntries() {
  const abs = path.join(repoRoot, HISTORY_FILE);
  if (!fs.existsSync(abs)) {
    return 0;
  }
  const text = fs.readFileSync(abs, "utf8");
  let n = 0;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*-\s*\[H-\d+\]/.test(line)) {
      n++;
    }
  }
  return n;
}

function generateIndexMd() {
  const doc = {
    formatVersion: FORMAT_VERSION,
    generator: SCRIPT,
    specCount: countSpecFolders(),
    requirementIdCount: countUniqueTraceabilityIds(),
    historyCount: countHistoryEntries(),
  };

  return (
    frontmatterYAML(doc) +
    "\n" +
    "# LeanSpec index\n\n" +
    "Snapshot: **`specCount`** (numbered spec folders with **`README.md`**), **`requirementIdCount`** (distinct bracket IDs **`[P-NNN]`**, **`[T-NNN]`**, … under **`specs/`**), **`historyCount`** (lines `- [H-NNN]` in **`specs/HISTORY.md`**). " +
    `Regenerate: \`${CMD}\`.\n`
  ).replace(/\n*$/, "\n");
}

function main() {
  const check = process.argv.includes(CHECK_FLAG);
  const content = generateIndexMd();
  const payloads = [[OUTPUT, content]];

  if (check) {
    for (const [relPath, expected] of payloads) {
      const abs = path.join(repoRoot, relPath);
      if (!fs.existsSync(abs)) {
        console.error(`${relPath} missing. Run: ${CMD}`);
        process.exit(1);
      }
      const actual = fs.readFileSync(abs, "utf8");
      if (actual !== expected) {
        console.error(`${relPath} is out of date. Run: ${CMD}`);
        process.exit(1);
      }
    }
    process.exit(0);
  }

  const abs = path.join(repoRoot, OUTPUT);
  const prev = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
  if (prev !== content) {
    fs.writeFileSync(abs, content, "utf8");
    console.warn(`Updated ${OUTPUT}`);
  }
}

main();
