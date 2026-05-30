import type { Job } from "@/domains/dom/types";
import { MessagingService } from "@/domains/message/messaging.service";
import type { CollectJobsAction } from "@/domains/plan/model/types";

type ErrorEnvelope = { __handlerError: true; errorMessage: string };

function isErrorEnvelope(v: unknown): v is ErrorEnvelope {
  return (
    v != null &&
    typeof v === "object" &&
    (v as Record<string, unknown>).__handlerError === true
  );
}

export class JobsListMessagingService {
  constructor(private readonly messagingService: MessagingService) {}

  async listJobs(action: CollectJobsAction, tabId: number): Promise<Job[]> {
    const result = await this.messagingService.request<
      "jobs.list",
      Job[] | ErrorEnvelope
    >({ to: "content", payload: { kind: "jobs.list", action }, tabId });

    if (isErrorEnvelope(result)) {
      throw new Error(result.errorMessage);
    }

    return result;
  }
}
