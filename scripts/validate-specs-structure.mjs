#!/usr/bin/env node

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const specsRoot = join(root, ".specs");
const requiredTopLevel = new Set(["docs", "product", "technical"]);
const optionalTopLevel = new Set(["beta1"]);
const allowedTopLevel = new Set([...requiredTopLevel, ...optionalTopLevel]);
const forbiddenPaths = [
  join(specsRoot, "quick"),
  join(specsRoot, "codebase"),
  join(root, ".notebook"),
];
const errors = [];

const kebabNameRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const kebabFileRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/;

function walk(dirPath) {
  for (const entry of readdirSync(dirPath)) {
    const fullPath = join(dirPath, entry);
    const relPath = relative(root, fullPath);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      if (!kebabNameRegex.test(entry)) {
        errors.push(
          `Invalid directory name (must be lowercase kebab-case): ${relPath}`,
        );
      }
      walk(fullPath);
      continue;
    }

    if (!kebabFileRegex.test(entry)) {
      errors.push(
        `Invalid file name (must be lowercase kebab-case): ${relPath}`,
      );
    }
  }
}

if (!existsSync(specsRoot)) {
  errors.push("Missing required .specs directory.");
} else {
  const topLevelDirs = readdirSync(specsRoot).filter((entry) =>
    statSync(join(specsRoot, entry)).isDirectory(),
  );
  for (const dir of topLevelDirs) {
    if (!allowedTopLevel.has(dir)) {
      errors.push(`Invalid top-level specs directory: .specs/${dir}`);
    }
  }

  for (const required of requiredTopLevel) {
    if (!topLevelDirs.includes(required)) {
      errors.push(
        `Missing required top-level specs directory: .specs/${required}`,
      );
    }
  }

  walk(specsRoot);
}

for (const path of forbiddenPaths) {
  if (existsSync(path)) {
    errors.push(`Forbidden path exists: ${relative(root, path)}`);
  }
}

if (errors.length > 0) {
  console.error("JT-SPECS validation failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("JT-SPECS validation passed.");
