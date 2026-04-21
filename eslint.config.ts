import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigPrettier from "eslint-config-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "apps/web/next-env.d.ts",
      "apps/web/src/gql/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: [
      "apps/web/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "packages/ui/**/*.{js,jsx,ts,tsx,mjs,cjs}",
    ],
    ...react.configs.flat.recommended,
    ...react.configs.flat["jsx-runtime"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    files: ["apps/web/**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    ...nextPlugin.configs["core-web-vitals"],
    rules: {
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
            "MemberExpression[object.object.name='process'][object.property.name='env']:not([property.name='CI']):not([property.name='E2E_PORT']):not([property.name='API_GRAPHQL_URL'])",
          message:
            "Only allowlisted env vars are allowed in apps/web config/codegen files (CI, E2E_PORT, API_GRAPHQL_URL).",
        },
      ],
    },
  },
  eslintConfigPrettier,
);
