#!/usr/bin/env node

// @ts-expect-error — no types
import nextPlugin from "@next/eslint-plugin-next";
import { ESLint } from "eslint";
// @ts-expect-error — no types
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
      },
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
      },
    },
  ],
});

let results: ESLint.LintResult[];
try {
  results = await eslint.lintFiles(patterns);
} catch (err: unknown) {
  if (
    typeof err === "object" &&
    err !== null &&
    "messageTemplate" in err &&
    (err as Record<string, unknown>).messageTemplate === "file-not-found"
  ) {
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
