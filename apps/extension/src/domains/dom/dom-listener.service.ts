import { CurrentTabContentService } from "@/domains/import-application/current-tab-content.service";
import { JobDetailsService } from "@/domains/job-details/job-details.service";
import { JobsListService } from "@/domains/jobs-list/jobs-list.service";
import { PopupLogService } from "@/domains/log/popup-log.service";
import type { ContentActionMessage } from "@/domains/message/types";
import { PaginationService } from "@/domains/pagination/pagination.service";

export class DomListenerService {
  constructor(
    private readonly jobsListService: JobsListService,
    private readonly jobDetailsService: JobDetailsService,
    private readonly paginationService: PaginationService,
    private readonly currentTabContentService: CurrentTabContentService,
    private readonly popupLogService: PopupLogService,
  ) {}

  async execute(message: ContentActionMessage) {
    await this.popupLogService.publishDebug("DomListenerService executing", {
      kind: message.kind,
      message,
    });

    switch (message.kind) {
      case "jobs.list":
        return await this.jobsListService.execute(message);
      case "job.details":
        return await this.jobDetailsService.execute(message);
      case "navigate.next.page":
        return await this.paginationService.navigateToNextPage(message);
      case "can.navigate.next.page":
        return await this.paginationService.canNavigateToNextPage(message);
      case "import.application":
        return this.currentTabContentService.execute();
      case "import.application.menu-label":
        return { label: this.currentTabContentService.getImportMenuLabel() };
    }
  }
}
