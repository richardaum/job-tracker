import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import testingLibrary from "eslint-plugin-testing-library";
import globals from "globals";
import tseslint from "typescript-eslint";

/** Matches import specifiers that reference a parent path segment (`..`). Disallowed under docs/CONVENTIONS.mdx (Imports); `./` sibling imports remain allowed. */
const parentRelativeImportSourcePattern =
  "(?:^|[/\\\\])\\.\\.(?:[/\\\\]|$)" as const;

export default defineConfig(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.next-dev/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "apps/extension/build/**",
      "apps/extension/.wxt/**",
      "apps/web/next-env.d.ts",
      "apps/web/src/gql/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: [
      "apps/api/**/*.{js,mjs,cjs,ts,tsx}",
      "packages/logger/**/*.{js,mjs,cjs,ts,tsx}",
      "*.config.{js,ts,mjs,cjs}",
      "scripts/**/*.{js,mjs,cjs,ts,tsx}",
      "turbo/**/*.{js,mjs,cjs,ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: parentRelativeImportSourcePattern,
              message:
                "Do not import via paths that traverse to a parent directory (..). Prefer workspace/package aliases from tsconfig paths. Same-directory ./ imports are fine. docs/CONVENTIONS.mdx (Imports).",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "apps/extension/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "apps/web/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "packages/ui/**/*.{js,jsx,ts,tsx,mjs,cjs}",
    ],
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks as Record<string, unknown> },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              importNames: ["forwardRef"],
              message:
                "Use ref as a standard component prop (React 19), not forwardRef. See docs/CONVENTIONS.mdx (TypeScript).",
            },
          ],
          patterns: [
            {
              regex: parentRelativeImportSourcePattern,
              message:
                "Do not import via paths that traverse to a parent directory (..). Use the app/package root alias (e.g. @/…) instead. Same-directory ./ imports are fine. docs/CONVENTIONS.mdx (Imports).",
            },
            {
              group: [
                "@/components/empty-state/internals",
                "@/components/empty-state/internals/**",
              ],
              message:
                "Import `EmptyState` from `@/components/empty-state` only; do not import empty-state internals.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='forwardRef']",
          message:
            "Do not use forwardRef; add ref to your props type and pass it to the DOM. See docs/CONVENTIONS.mdx (TypeScript).",
        },
        {
          selector:
            "CallExpression[callee.type='MemberExpression'][callee.property.type='Identifier'][callee.property.name='forwardRef']",
          message:
            "Do not use forwardRef; add ref to your props type and pass it to the DOM. See docs/CONVENTIONS.mdx (TypeScript).",
        },
        {
          selector: "JSXAttribute[name.name='className'] > Literal",
          message: "Use className={cn(...)} instead of string literals.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] JSXExpressionContainer > Literal",
          message: "Use className={cn(...)} instead of string literals.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] JSXExpressionContainer > TemplateLiteral",
          message: "Use className={cn(...)} instead of template literals.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] JSXExpressionContainer > ArrayExpression",
          message: "Use className={cn(...)} instead of array join patterns.",
        },
      ],
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["apps/web/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: { "@next/next": nextPlugin as Record<string, unknown> },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    files: ["apps/web/src/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    ignores: [
      "apps/web/src/env/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "apps/web/src/instrumentation.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Avoid direct process.env access in apps/web source. Use typed env modules from src/env instead.",
        },
      ],
    },
  },
  {
    files: ["apps/web/*.config.ts", "apps/web/codegen.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.object.name='process'][object.property.name='env']:not([property.name='CI']):not([property.name='E2E_PORT']):not([property.name='API_GRAPHQL_URL']):not([property.name='NODE_ENV'])",
          message:
            "Only allowlisted env vars are allowed in apps/web config/codegen files (CI, E2E_PORT, API_GRAPHQL_URL, NODE_ENV).",
        },
      ],
    },
  },
  {
    files: [
      "apps/extension/**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs}",
      "apps/web/src/**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs}",
      "packages/ui/**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs}",
    ],
    ...testingLibrary.configs["flat/react"],
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}", "packages/ui/src/**/*.{ts,tsx}"],
    ignores: [
      "**/*.stories.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
      "apps/web/src/gql/**",
    ],
    languageOptions: { parserOptions: { projectService: true } },
    rules: { "@typescript-eslint/no-deprecated": "error" },
  },
  eslintConfigPrettier,
);
