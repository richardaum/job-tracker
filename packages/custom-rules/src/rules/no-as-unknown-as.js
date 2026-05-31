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
      description: 'Disallow "as unknown as X" double type assertions that bypass type safety.',
    },
  },

  create(context) {
    return {
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
