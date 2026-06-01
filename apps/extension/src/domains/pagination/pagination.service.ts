import type { ContentActionMessage } from "@/domains/message/types";

import { NextButtonService } from "./next-button.service";

type PaginationActionMessage = Extract<ContentActionMessage, { kind: "navigate.next.page" | "can.navigate.next.page" }>;

export class PaginationService {
  constructor(private readonly nextButtonService: NextButtonService) {}

  async navigateToNextPage(message: PaginationActionMessage) {
    const pagination = message.action.input.pagination;
    if (!pagination) return;

    switch (pagination.kind) {
      case "next-button":
        return await this.nextButtonService.execute(message);
    }
  }

  async canNavigateToNextPage(message: PaginationActionMessage) {
    const pagination = message.action.input.pagination;
    if (!pagination) return false;

    switch (pagination.kind) {
      case "next-button":
        return await this.nextButtonService.canNavigateToNextPage(message);
    }
  }
}
