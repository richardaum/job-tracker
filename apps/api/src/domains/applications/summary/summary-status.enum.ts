import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationSummaryStatus {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

registerEnumType(ApplicationSummaryStatus, { name: "SummaryStatus" });
