import type { Job } from "@/domains/dom/types";
import { MessagingService } from "@/domains/message/messaging.service";
import type { PlanStepAction } from "@/domains/plan/model/types";

export class JobsListMessagingService {
  constructor(private readonly messagingService: MessagingService) {}

  async listJobs(action: PlanStepAction, tabId: number): Promise<Job[]> {
    return await this.messagingService.request<"jobs.list", Job[]>({
      to: "content",
      payload: { kind: "jobs.list", action },
      tabId,
    });
  }
}
