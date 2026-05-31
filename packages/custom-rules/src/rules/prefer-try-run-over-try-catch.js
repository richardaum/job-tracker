/** @type {import('eslint').Rule.RuleModule} */
export const preferTryRunOverTryCatch = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      preferTryRun:
        "Avoid try/catch; for promise errors prefer `await tryRun(promise)` from `@job-tracker/try-run`. Only use try/catch when you need `finally`, a typed catch (e.g. `instanceof`), or a framework boundary.",
    },
    docs: {
      description:
        "Discourage try/catch in favor of `@job-tracker/try-run` `tryRun()` for promise errors where applicable.",
    },
  },

  create(context) {
    return {
      TryStatement(node) {
        if (!node.handler) {
          return;
        }

        if (node.finalizer) {
          return;
        }

        if (
          node.handler.param &&
          usesInstanceOf(node.handler.param, node.handler.body)
        ) {
          return;
        }

        context.report({ node, messageId: "preferTryRun" });
      },
    };
  },
};

function usesInstanceOf(param, body) {
  if (!param || !body) return false;

  return findInstanceOf(body, param.name);
}

function findInstanceOf(node, paramName) {
  if (!node || typeof node !== "object") return false;

  if (
    node.type === "BinaryExpression" &&
    node.operator === "instanceof" &&
    node.left.type === "Identifier" &&
    node.left.name === paramName
  ) {
    return true;
  }

  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const c of child) {
        if (c && typeof c === "object" && findInstanceOf(c, paramName))
          return true;
      }
    } else if (child && typeof child === "object") {
      if (findInstanceOf(child, paramName)) return true;
    }
  }

  return false;
}
