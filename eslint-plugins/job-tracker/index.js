/**
 * @typedef {import('estree').Node} Node
 * @typedef {import('estree').TryStatement} TryStatement
 * @typedef {import('estree').BlockStatement} BlockStatement
 */

/** @param {Node} node */
function isAwaitExpression(node) {
  return node.type === "AwaitExpression";
}

/**
 * @param {Node} node
 * @param {(n: Node) => void} fn
 */
function walk(node, fn) {
  if (!node || typeof node !== "object") {
    return;
  }
  fn(node);
  for (const key of Object.keys(node)) {
    if (key === "parent") {
      continue;
    }
    const v = /** @type {Record<string, unknown>} */ (node)[key];
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item && typeof item === "object" && "type" in item) {
          walk(/** @type {Node} */ (item), fn);
        }
      }
    } else if (v && typeof v === "object" && "type" in v) {
      walk(/** @type {Node} */ (v), fn);
    }
  }
}

/**
 * @param {BlockStatement} block
 * @returns {boolean}
 */
function blockContainsAwait(block) {
  let found = false;
  walk(block, (n) => {
    if (isAwaitExpression(n)) {
      found = true;
    }
  });
  return found;
}

/** @type {import('eslint').Rule.RuleModule} */
export const preferToOverAsyncTryCatch = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      preferTo:
        "Prefer `await to(promise)` from `@job-tracker/async` instead of try/catch around awaited promises unless you need `finally`, a typed catch (e.g. `instanceof`), or a framework boundary. docs/CONVENTIONS.mdx (Async errors).",
    },
    docs: {
      description:
        "Discourage try/catch around async work in favor of `@job-tracker/async` `to()`.",
    },
  },

  /** @returns {import('eslint').Rule.RuleListener} */
  create(context) {
    return {
      /** @param {TryStatement} node */
      TryStatement(node) {
        if (!node.handler) {
          return;
        }

        if (node.finalizer) {
          return;
        }

        const tryBlock = node.block;

        // Only flag when awaiting inside the **try** block (catch/finally excluded).
        if (!blockContainsAwait(tryBlock)) {
          return;
        }

        context.report({ node, messageId: "preferTo" });
      },
    };
  },
};

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  meta: { name: "@job-tracker/eslint-plugin-job-tracker", version: "0.0.0" },
  rules: { "prefer-to-over-async-try-catch": preferToOverAsyncTryCatch },
};

export default plugin;
