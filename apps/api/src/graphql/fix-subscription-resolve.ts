import { GraphQLSchema } from "graphql";

export function fixSubscriptionResolve(schema: GraphQLSchema): GraphQLSchema {
  const subType = schema.getSubscriptionType();
  if (!subType) return schema;
  for (const field of Object.values(subType.getFields())) {
    if (field.resolve) continue;
    Object.defineProperty(field, "resolve", {
      value: (payload: unknown) => payload,
      writable: true,
      configurable: true,
    });
  }
  return schema;
}
