import type { IconProps } from "@phosphor-icons/react";

import { KeywordScope } from "@/gql/graphql";
import { conceptIcon } from "@job-tracker/ui";

export const SCOPE_ICON_CONFIG: Record<
  KeywordScope,
  { label: string; icon: React.ComponentType<IconProps>; colorClass: string }
> = {
  [KeywordScope.Title]: { label: "Title", icon: conceptIcon.title, colorClass: "text-blue-700" },
  [KeywordScope.Description]: { label: "Description", icon: conceptIcon.description, colorClass: "text-amber-700" },
  [KeywordScope.Company]: { label: "Company", icon: conceptIcon.company, colorClass: "text-emerald-700" },
};
