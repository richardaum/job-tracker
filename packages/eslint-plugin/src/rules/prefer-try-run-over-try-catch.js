/** @type {import('eslint').Rule.RuleModule} */
export const preferTryRunOverTryCatch = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      preferTryRun:
        "Avoid try/catch; for promise errors prefer `await tryRun(promise)` from `@job-tracker/try-run`. Only use try/catch when you need `finally`, a typed catch (e.g. `instanceof`), or a framework boundary. docs/CONVENTIONS.mdx (Async errors).",
    },
    docs: {
      description:
        "Discourage try/catch in favor of `@job-tracker/try-run` `tryRun()` for promise errors where applicable.",
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

        context.report({ node, messageId: "preferTryRun" });
      },
    };
  },
};
