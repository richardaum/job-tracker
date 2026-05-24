import type { TypePolicies } from "@apollo/client";

export const apolloCacheTypePolicies: TypePolicies = {
  MatchItemType: { keyFields: ["id"] },
};
