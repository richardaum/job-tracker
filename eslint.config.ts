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
  eslintConfigPrettier,
);
