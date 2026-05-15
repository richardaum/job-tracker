import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Controller, Param, Req, Sse, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { Observable } from "rxjs";

import {
  ApplicationEventBus,
  type SummaryStatusChangedEvent,
} from "./application-event.bus";

type RequestWithUser = Request & { user?: { userId?: string } };

@Controller("applications")
@UseGuards(JwtAuthGuard)
export class ApplicationsSseController {
  constructor(private readonly eventBus: ApplicationEventBus) {}

  @Sse(":id/stream")
  stream(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): Observable<{
    data: { applicationId: string; status: string };
    type: string;
  }> {
    return new Observable<{
      data: { applicationId: string; status: string };
      type: string;
    }>((observer) => {
      const handler = (event: SummaryStatusChangedEvent) => {
        if (event.applicationId !== id) return;
        if (event.userId !== req.user?.userId) return;

        observer.next({
          data: { applicationId: id, status: event.status },
          type: "summary_status_changed",
        });
      };

      this.eventBus.onSummaryStatusChanged(handler);

      return () => {
        this.eventBus.removeSummaryStatusChangedListener(handler);
      };
    });
  }
}
