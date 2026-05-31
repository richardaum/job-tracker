import type { Job } from "@/domains/dom/types";
import { MessagingService } from "@/domains/message/messaging.service";
import type { CollectJobsAction } from "@job-tracker/plan-schemas";

type ErrorEnvelope = { __handlerError: true; errorMessage: string };

export type ListJobsResult = { jobs: Job[]; skippedCount: number };

function isErrorEnvelope(v: unknown): v is ErrorEnvelope {
  return v != null && typeof v === "object" && (v as Record<string, unknown>).__handlerError === true;
}

export class JobsListMessagingService {
  constructor(private readonly messagingService: MessagingService) {}

  async listJobs(action: CollectJobsAction, tabId: number, sourceRunId?: string): Promise<ListJobsResult> {
    const result = await this.messagingService.request<"jobs.list", ListJobsResult | ErrorEnvelope>({
      to: "content",
      payload: { kind: "jobs.list", action, sourceRunId },
      tabId,
    });

    if (isErrorEnvelope(result)) {
      throw new Error(result.errorMessage);
    }

    return result;
  }
}
