/** @type {import('eslint').Rule.RuleModule} */
export const preferToOverTryCatch = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      preferTo:
        "Avoid try/catch; for promise errors prefer `await to(promise)` from `@job-tracker/async`. Only use try/catch when you need `finally`, a typed catch (e.g. `instanceof`), or a framework boundary. docs/CONVENTIONS.mdx (Async errors).",
    },
    docs: {
      description:
        "Discourage try/catch in favor of `@job-tracker/async` `to()` for promise errors where applicable.",
    },
  },

  /** @returns {import('eslint').Rule.RuleListener} */
  create(context) {
    return {
      /** @param {import('estree').TryStatement} node */
      TryStatement(node) {
        if (!node.handler) {
          return;
        }

        if (node.finalizer) {
          return;
        }

        context.report({ node, messageId: "preferTo" });
      },
    };
  },
};
