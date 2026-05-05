import type { ContentActionMessage } from "@/domains/message/types";

import { NextButtonService } from "./next-button.service";

export class PaginationService {
  constructor(private readonly nextButtonService: NextButtonService) {}

  async navigateToNextPage(message: ContentActionMessage) {
    const pagination = message.action.input.pagination;
    if (!pagination) return;

    switch (pagination.kind) {
      case "next-button":
        return await this.nextButtonService.execute(message);
    }
  }

  async canNavigateToNextPage(message: ContentActionMessage) {
    const pagination = message.action.input.pagination;
    if (!pagination) return false;

    switch (pagination.kind) {
      case "next-button":
        return await this.nextButtonService.canNavigateToNextPage(message);
    }
  }
}
