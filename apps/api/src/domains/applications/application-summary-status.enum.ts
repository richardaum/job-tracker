import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationSummaryStatus {
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

registerEnumType(ApplicationSummaryStatus, { name: "SummaryStatus" });
