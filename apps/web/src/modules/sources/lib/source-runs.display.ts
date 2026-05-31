import type { Badge } from "@job-tracker/ui";
import type { ComponentProps } from "react";

import { SourceRunStatus } from "@/gql/graphql";

export function sourceRunStatusBadgeIntent(status: SourceRunStatus): ComponentProps<typeof Badge>["intent"] {
  switch (status) {
    case SourceRunStatus.Completed:
      return "success";
    case SourceRunStatus.Failed:
      return "error";
    case SourceRunStatus.Pending:
      return "info";
  }
}

export function formatSourceRunStatusLabel(status: SourceRunStatus): string {
  return status.replaceAll("_", " ");
}
