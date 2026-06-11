/** @type {import('eslint').Rule.RuleModule} */
export const noAsNever = {
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [],
    messages: {
      noAsNever:
        'Avoid "as never" type assertions — they subvert all type safety. Refactor to use a proper type annotation or type guard instead.',
    },
    docs: { description: 'Disallow "as never" type assertions that bypass all type safety.' },
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      TSAsExpression(node) {
        if (node.typeAnnotation.type === "TSNeverKeyword") {
          context.report({
            node,
            messageId: "noAsNever",
            fix: (fixer) => fixer.replaceText(node, sourceCode.getText(node.expression)),
          });
        }
      },
    };
  },
};
