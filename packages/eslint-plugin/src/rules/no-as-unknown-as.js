/** @type {import('eslint').Rule.RuleModule} */
export const noAsUnknownAs = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      noAsUnknownAs:
        'Avoid "as unknown as X" double type assertions — they bypass TypeScript type safety entirely. Define the value with the expected type at declaration time or use a type guard.',
    },
    docs: {
      description:
        'Disallow "as unknown as X" double type assertions that bypass type safety.',
    },
  },

  /** @returns {import('eslint').Rule.RuleListener} */
  create(context) {
    return {
      /** @param {import("@typescript-eslint/typescript-estree").TSESTree.TSAsExpression} node */
      TSAsExpression(node) {
        if (
          node.expression.type === "TSAsExpression" &&
          node.expression.typeAnnotation.type === "TSUnknownKeyword"
        ) {
          context.report({ node, messageId: "noAsUnknownAs" });
        }
      },
    };
  },
};
