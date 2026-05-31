/** @type {import('eslint').Rule.RuleModule} */
export const enumPascalCase = {
  meta: {
    type: "suggestion",
    schema: [],
    messages: {
      enumPascalCase: 'Enum name "{{ name }}" must be PascalCase (start with uppercase letter).',
      enumSuffix: 'Enum "{{ name }}" should end with the "Enum" suffix (e.g. "{{ suggestion }}").',
      enumMemberKey: 'Enum member "{{ key }}" in {{ parent }} must be PascalCase (e.g. "{{ suggestion }}").',
      enumMemberValue:
        'Enum member value "{{ value }}" in {{ parent }} must match its key (expected "{{ suggestion }}").',
    },
    docs: {
      description:
        "Enforce PascalCase names with Enum suffix for declarations, and PascalCase for member keys. Values must match their key. Strict PascalCase: no underscores, no consecutive uppercase letters.",
    },
  },

  create(context) {
    return {
      TSEnumDeclaration(node) {
        const parentName = node.id.name;

        if (!/^(?=.*[a-z])[A-Z][a-zA-Z0-9]*$/.test(parentName)) {
          context.report({ node: node.id, messageId: "enumPascalCase", data: { name: parentName } });
        }

        if (!parentName.endsWith("Enum")) {
          const suggestion = `${parentName}Enum`;
          context.report({ node: node.id, messageId: "enumSuffix", data: { name: parentName, suggestion } });
        }

        const members = node.body?.members ?? node.members ?? [];
        for (const member of members) {
          const keyNode = member.id;

          if (keyNode && keyNode.type === "Identifier") {
            const key = keyNode.name;

            if (!/^(?=.*[a-z])[A-Z][a-zA-Z0-9]*$/.test(key)) {
              context.report({
                node: keyNode,
                messageId: "enumMemberKey",
                data: {
                  key,
                  parent: parentName,
                  suggestion: key.includes("_")
                    ? key
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join("")
                    : key.charAt(0).toUpperCase() +
                      (key.slice(1) === key.slice(1).toUpperCase() ? key.slice(1).toLowerCase() : key.slice(1)),
                },
              });
            }

            const init = member.initializer;
            if (init && init.type === "Literal" && typeof init.value === "string") {
              const value = init.value;
              if (value !== key) {
                context.report({
                  node: init,
                  messageId: "enumMemberValue",
                  data: { value, parent: parentName, suggestion: key },
                });
              }
            }
          }
        }
      },
    };
  },
};
