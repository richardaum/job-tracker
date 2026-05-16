#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { stringify as yamlStringify } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const specsDir = path.join(repoRoot, "specs");

const SCRIPT = "scripts/sync-spec-indices.ts";
const CMD = "pnpm leanspec:sync-spec-indices";
const REQ_MAP_SCRIPT = path.join(
  repoRoot,
  "scripts/generate-requirement-id-map.ts",
);
const OUTPUT = "specs/INDEX.md";
const HISTORY_FILE = "specs/HISTORY.md";

const SPEC_DIR = /^\d{3}-/;
const TRACE_RE = /\[(P|T|R|H|F)-(\d+)\]/g;

const SKIP_REQ_SCAN = new Set([OUTPUT, "specs/README.md"]);

const CHECK_FLAG = "--check";

const FORMAT_VERSION = 1;

interface IndexDoc {
  formatVersion: number;
  generator: string;
  specCount: number;
  requirementIdCount: number;
  historyCount: number;
}

function frontmatterYAML(doc: IndexDoc): string {
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

function countSpecFolders(): number {
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

function listSpecMarkdownPaths(): string[] {
  const out: string[] = [];
  function walk(currentAbs: string): void {
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

function countUniqueTraceabilityIds(): number {
  const seen = new Set<string>();
  for (const posix of listSpecMarkdownPaths()) {
    const text = fs.readFileSync(path.join(repoRoot, posix), "utf8");
    TRACE_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = TRACE_RE.exec(text)) !== null) {
      seen.add(`${match[1]}-${match[2]}`);
    }
  }
  return seen.size;
}

function countHistoryEntries(): number {
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

function generateIndexMd(): string {
  const doc: IndexDoc = {
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

function main(): void {
  const check = process.argv.includes(CHECK_FLAG);
  const content = generateIndexMd();
  const payloads: [string, string][] = [[OUTPUT, content]];

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
    execFileSync(
      process.execPath,
      ["--experimental-strip-types", REQ_MAP_SCRIPT, CHECK_FLAG],
      { cwd: repoRoot, stdio: "inherit" },
    );
    process.exit(0);
  }

  const abs = path.join(repoRoot, OUTPUT);
  const prev = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
  if (prev !== content) {
    fs.writeFileSync(abs, content, "utf8");
    console.warn(`Updated ${OUTPUT}`);
  }

  execFileSync(
    process.execPath,
    ["--experimental-strip-types", REQ_MAP_SCRIPT],
    { cwd: repoRoot, stdio: "inherit" },
  );
}

main();
