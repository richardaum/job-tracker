import { preferTryRunOverTryCatch } from "./rules/prefer-try-run-over-try-catch.js";

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: { name: "@job-tracker/eslint-plugin", version: "0.0.1" },
  rules: { "prefer-try-run-over-try-catch": preferTryRunOverTryCatch },
};

export default plugin;
