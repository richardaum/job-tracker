import { MessagingService } from "@/domains/message/messaging.service";
import type { CollectJobsAction } from "@/domains/plan/model/types";

export class PaginationMessagingService {
  constructor(private readonly messagingService: MessagingService) {}

  async canNavigateToNextPage(action: CollectJobsAction, tabId: number): Promise<boolean> {
    return await this.messagingService.request<"can.navigate.next.page", boolean>({
      to: "content",
      payload: { kind: "can.navigate.next.page", action },
      tabId,
    });
  }

  async navigateToNextPage(action: CollectJobsAction, tabId: number): Promise<void> {
    await this.messagingService.request<"navigate.next.page", void>({
      to: "content",
      payload: { kind: "navigate.next.page", action },
      tabId,
    });
  }
}
