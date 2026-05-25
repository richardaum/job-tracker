#!/usr/bin/env node

import jobTrackerPlugin from "@job-tracker/eslint-plugin";
import { tryRun } from "@job-tracker/try-run";
import nextPlugin from "@next/eslint-plugin-next";
import { ESLint } from "eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { parser as tsParser } from "typescript-eslint";

const IGNORE_PATTERNS: readonly string[] = [
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/storybook-static/**",
  "**/coverage/**",
  "apps/extension/build/**",
  "apps/extension/.wxt/**",
  "apps/web/src/gql/**",
  "apps/web/next-env.d.ts",
];

const patterns = process.argv.slice(2);
if (patterns.length === 0) {
  console.error(
    "Usage: node --experimental-strip-types scripts/fix-imports.ts <glob1> [glob2 …]",
  );
  process.exit(1);
}

const eslint = new ESLint({
  fix: true,
  warnIgnored: false,
  overrideConfigFile: true,
  overrideConfig: [
    { ignores: [...IGNORE_PATTERNS] },
    {
      files: ["**/*.{ts,tsx}"],
      plugins: {
        "simple-import-sort": simpleImportSort as Record<string, unknown>,
        "@next/next": nextPlugin as Record<string, unknown>,
        "job-tracker": jobTrackerPlugin as Record<string, unknown>,
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
        "simple-import-sort": simpleImportSort as Record<string, unknown>,
        "@next/next": nextPlugin as Record<string, unknown>,
        "job-tracker": jobTrackerPlugin as Record<string, unknown>,
      },
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
      },
    },
  ],
});

const [lintErr, lintResults] = await tryRun(eslint.lintFiles(patterns));
if (lintErr) {
  if (
    typeof lintErr === "object" &&
    lintErr !== null &&
    "messageTemplate" in lintErr &&
    (lintErr as Record<string, unknown>).messageTemplate === "file-not-found"
  ) {
    process.exit(0);
  }
  throw lintErr;
}
if (lintResults == null) {
  throw new Error("eslint.lintFiles returned no results");
}
const results: ESLint.LintResult[] = lintResults;
await ESLint.outputFixes(results);

const errors = results.filter((r) => r.errorCount > 0 || r.warningCount > 0);
if (errors.length > 0) {
  const formatter = await eslint.loadFormatter("stylish");
  process.stdout.write(await formatter.format(results));
  process.exit(1);
}
