import type { Job } from "@/domains/dom/types";
import { MessagingService } from "@/domains/message/messaging.service";
import type { PlanStepAction } from "@/domains/plan/model/types";

export class JobDetailsMessagingService {
  constructor(private readonly messagingService: MessagingService) {}

  async getJobDetails(
    action: PlanStepAction,
    tabId: number,
  ): Promise<Job | undefined> {
    return await this.messagingService.request<"job.details", Job | undefined>({
      to: "content",
      payload: { kind: "job.details", action },
      tabId,
    });
  }
}
