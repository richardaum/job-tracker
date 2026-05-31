import { enumPascalCase } from "./rules/enum-pascalcase.js";
import { noAsUnknownAs } from "./rules/no-as-unknown-as.js";
import { noInlineComponentProps } from "./rules/no-inline-component-props.js";
import { preferCnForClassName } from "./rules/prefer-cn-for-classname.js";
import { preferTryRunOverTryCatch } from "./rules/prefer-try-run-over-try-catch.js";

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: { name: "@job-tracker/oxlint-plugin", version: "0.0.1" },
  rules: {
    "enum-pascalcase": enumPascalCase,
    "no-inline-component-props": noInlineComponentProps,
    "prefer-cn-for-classname": preferCnForClassName,
    "prefer-try-run-over-try-catch": preferTryRunOverTryCatch,
    "no-as-unknown-as": noAsUnknownAs,
  },
};

export default plugin;
