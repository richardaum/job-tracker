#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const SCRIPT = new URL("fix-imports.mjs", import.meta.url).pathname;
const REPO_ROOT = new URL("..", import.meta.url).pathname;

/** @param {string[]} args */
function runScript(...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf-8",
    cwd: REPO_ROOT,
  });
}

/**
 * Create a temp directory inside the repo root (so ESLint doesn't reject
 * files "outside base path"). Returns path and a cleanup function.
 */
function tmpDirInRepo() {
  const dir = join(
    REPO_ROOT,
    `.tmp-test-${process.pid}-${Math.random().toString(36).slice(2, 8)}`,
  );
  mkdirSync(dir, { recursive: true });
  const clean = () => rmSync(dir, { recursive: true, force: true });
  return { dir, clean };
}

describe("fix-imports.mjs", () => {
  it("exits with 1 and prints usage when no args", () => {
    const result = runScript();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage/i);
  });

  it("exits with 0 on already-sorted file", () => {
    const result = runScript(SCRIPT);
    assert.equal(result.status, 0);
  });

  it("fixes import order in a .ts file", () => {
    const { dir, clean } = tmpDirInRepo();
    const filePath = join(dir, "test.ts");
    try {
      writeFileSync(
        filePath,
        [
          'import { z } from "zod";',
          'import fs from "node:fs";',
          'import { something } from "./local";',
          'import React from "react";',
          "",
          'console.log("hello");',
        ].join("\n"),
      );

      const result = runScript(filePath);
      assert.equal(result.status, 0, `stderr: ${result.stderr}`);

      const content = readFileSync(filePath, "utf-8");
      const importLines = content
        .split("\n")
        .filter((l) => l.startsWith("import "));
      assert.equal(importLines.length, 4);

      // node:fs is a builtin → first group
      assert.ok(
        importLines[0].includes("node:fs"),
        `expected node:fs first, got: ${importLines[0]}`,
      );
      // react and zod are externals → second group (order among them doesn't matter)
      const externalIdx = importLines.findIndex(
        (l) => l.includes("react") || l.includes("zod"),
      );
      assert.notEqual(externalIdx, -1);
      // ./local is a sibling → last group
      assert.ok(
        importLines[importLines.length - 1].includes("./local"),
        `expected ./local last, got: ${importLines[importLines.length - 1]}`,
      );
    } finally {
      clean();
    }
  });

  it("fixes import order in a .tsx file", () => {
    const { dir, clean } = tmpDirInRepo();
    const filePath = join(dir, "test.tsx");
    try {
      writeFileSync(
        filePath,
        [
          'import { Button } from "./ui/Button";',
          'import React from "react";',
          "",
          "export default function Page() { return <Button />; }",
        ].join("\n"),
      );

      const result = runScript(filePath);
      assert.equal(result.status, 0, `stderr: ${result.stderr}`);

      const content = readFileSync(filePath, "utf-8");
      const importLines = content
        .split("\n")
        .filter((l) => l.startsWith("import "));
      assert.equal(importLines.length, 2);
      // react (external) should come before ./ui/Button (sibling)
      assert.ok(importLines[0].includes("react"));
      assert.ok(importLines[1].includes("./ui/Button"));
    } finally {
      clean();
    }
  });

  it("handles non-matching glob gracefully", () => {
    const result = runScript("nonexistent-folder/**/*.ts");
    assert.equal(result.status, 0);
  });

  it("handles multiple file args", () => {
    const result = runScript(SCRIPT, "scripts/fix-imports.mjs");
    assert.equal(result.status, 0);
  });

  it("idempotent — second pass makes no changes", () => {
    const { dir, clean } = tmpDirInRepo();
    const filePath = join(dir, "test.ts");
    try {
      writeFileSync(
        filePath,
        [
          'import fs from "node:fs";',
          'import { z } from "zod";',
          'import React from "react";',
          'import { local } from "./local";',
          "",
          "export const x = 1;",
        ].join("\n"),
      );

      const first = runScript(filePath);
      assert.equal(first.status, 0);
      const afterFirst = readFileSync(filePath, "utf-8");

      const second = runScript(filePath);
      assert.equal(second.status, 0);
      const afterSecond = readFileSync(filePath, "utf-8");

      assert.equal(afterFirst, afterSecond, "second pass should be no-op");
    } finally {
      clean();
    }
  });
});
