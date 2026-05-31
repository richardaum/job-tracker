/** @type {import('eslint').Rule.RuleModule} */
export const noInlineComponentProps = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      noInlineProps:
        "Define component props as a separate type or interface (e.g. 'type Props = ...') instead of an inline object literal type.",
    },
    docs: {
      description:
        "Disallow inline object type annotations for React component props. Require a named type or interface.",
    },
  },

  create(context) {
    function isPascalCase(name) {
      return /^[A-Z]/.test(name);
    }

    function reportIfInlineProps(firstParam) {
      if (!firstParam || !firstParam.typeAnnotation) return;

      const typeAnnotation = firstParam.typeAnnotation.typeAnnotation;
      if (typeAnnotation.type === "TSTypeLiteral") {
        context.report({ node: typeAnnotation, messageId: "noInlineProps" });
      }
    }

    return {
      FunctionDeclaration(node) {
        if (node.id && isPascalCase(node.id.name)) {
          reportIfInlineProps(node.params[0]);
        }
      },
      VariableDeclarator(node) {
        if (
          node.id &&
          isPascalCase(node.id.name) &&
          node.init &&
          (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression")
        ) {
          reportIfInlineProps(node.init.params[0]);
        }
      },
    };
  },
};
