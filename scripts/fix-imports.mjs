#!/usr/bin/env node
/**
 * Apply `simple-import-sort` fixer only — no type-checking, no React/Next/Tailwind plugins.
 *
 * Roughly 10× faster than full `lint:fix` because ESLint only loads 2 rules.
 *
 * Usage:
 *   node scripts/fix-imports.mjs "apps/web/src/<dirs>/*.{ts,tsx}"
 *   node scripts/fix-imports.mjs "apps/api/<dirs>/*.ts" "packages/<dirs>/*.ts"
 */

import nextPlugin from "@next/eslint-plugin-next";
import { ESLint } from "eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { parser as tsParser } from "typescript-eslint";

/** @readonly */
const IGNORE_PATTERNS = Object.freeze([
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/storybook-static/**",
  "**/coverage/**",
  "apps/extension/build/**",
  "apps/extension/.wxt/**",
  "apps/web/src/gql/**",
  "apps/web/next-env.d.ts",
]);

const patterns = process.argv.slice(2);
if (patterns.length === 0) {
  console.error("Usage: node scripts/fix-imports.mjs <glob1> [glob2 …]");
  process.exit(1);
}

const eslint = new ESLint({
  fix: true,
  warnIgnored: false,
  overrideConfigFile: true,
  overrideConfig: [
    { ignores: IGNORE_PATTERNS },
    {
      files: ["**/*.{ts,tsx}"],
      plugins: {
        "simple-import-sort": simpleImportSort,
        "@next/next": nextPlugin,
      },
      languageOptions: {
        parser: tsParser,
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
      },
    },
    {
      files: ["**/*.{js,jsx,mjs,cjs}"],
      plugins: {
        "simple-import-sort": simpleImportSort,
        "@next/next": nextPlugin,
      },
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
      },
    },
  ],
});

/** @type {import("eslint").ESLint.LintResult[]} */
let results;
try {
  results = await eslint.lintFiles(patterns);
} catch (err) {
  if (err.messageTemplate === "file-not-found") {
    process.exit(0);
  }
  throw err;
}
await ESLint.outputFixes(results);

const errors = results.filter((r) => r.errorCount > 0 || r.warningCount > 0);
if (errors.length > 0) {
  const formatter = await eslint.loadFormatter("stylish");
  process.stdout.write(await formatter.format(results));
  process.exit(1);
}
