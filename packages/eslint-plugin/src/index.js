import { preferToOverTryCatch } from "./rules/prefer-to-over-try-catch.js";

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: { name: "@job-tracker/eslint-plugin", version: "0.0.1" },
  rules: { "prefer-to-over-try-catch": preferToOverTryCatch },
};

export default plugin;
