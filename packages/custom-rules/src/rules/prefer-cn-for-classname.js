/**
 * @import { Rule } from "eslint"
 * @type {Rule.RuleModule}
 */
export const preferCnForClassName = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      preferCn: "Use className={cn(...)} instead of {{type}}.",
    },
    docs: {
      description: "Enforce using cn() for all className JSX attributes.",
    },
  },

  create(context) {
    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;
        if (!node.value) return;

        if (
          node.value.type === "Literal" &&
          typeof node.value.value === "string"
        ) {
          context.report({
            node,
            messageId: "preferCn",
            data: { type: "string literals" },
          });
          return;
        }

        if (node.value.type === "JSXExpressionContainer") {
          const expr = node.value.expression;

          if (expr.type === "Literal") {
            context.report({
              node,
              messageId: "preferCn",
              data: { type: "string literals" },
            });
          } else if (expr.type === "TemplateLiteral") {
            context.report({
              node,
              messageId: "preferCn",
              data: { type: "template literals" },
            });
          } else if (expr.type === "ArrayExpression") {
            context.report({
              node,
              messageId: "preferCn",
              data: { type: "array join patterns" },
            });
          } else if (
            expr.type === "CallExpression" &&
            expr.callee.name === "cn"
          ) {
            return;
          }
        }
      },
    };
  },
};
