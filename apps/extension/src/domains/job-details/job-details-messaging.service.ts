import type { Job } from "@/domains/dom/types";
import { MessagingService } from "@/domains/message/messaging.service";
import type { CollectJobsAction } from "@job-tracker/plan-schemas";

export class JobDetailsMessagingService {
  constructor(private readonly messagingService: MessagingService) {}

  async getJobDetails(action: CollectJobsAction, tabId: number): Promise<Job | undefined> {
    return await this.messagingService.request<"job.details", Job | undefined>({
      to: "content",
      payload: { kind: "job.details", action },
      tabId,
    });
  }
}
