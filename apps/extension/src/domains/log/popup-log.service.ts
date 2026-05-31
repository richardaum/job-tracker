import { MessagingService } from "@/domains/message/messaging.service";

export class PopupLogService {
  constructor(private readonly messagingService: MessagingService) {}

  async publishDebug(message: string, ...data: unknown[]): Promise<void> {
    await this.messagingService.publish({
      to: "background",
      kind: "log.event",
      payload: { level: "debug", message, data, timestamp: new Date().toISOString() },
    });
  }
}
