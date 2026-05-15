import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Controller, Param, Req, Sse, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { Observable } from "rxjs";

import {
  DraftApplicationEventBus,
  type DraftConversionStatusChangedEvent,
} from "./draft-application-event.bus";

type RequestWithUser = Request & { user?: { userId?: string } };

@Controller("draft-applications")
@UseGuards(JwtAuthGuard)
export class DraftApplicationsSseController {
  constructor(private readonly eventBus: DraftApplicationEventBus) {}

  @Sse(":id/stream")
  stream(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): Observable<{ data: { draftId: string; status: string }; type: string }> {
    return new Observable<{
      data: { draftId: string; status: string };
      type: string;
    }>((observer) => {
      const handler = (event: DraftConversionStatusChangedEvent) => {
        if (event.draftId !== id) return;
        if (event.userId !== req.user?.userId) return;

        observer.next({
          data: { draftId: id, status: event.status },
          type: "draft_conversion_status_changed",
        });
      };

      this.eventBus.onDraftConversionStatusChanged(handler);

      return () => {
        this.eventBus.removeDraftConversionStatusChangedListener(handler);
      };
    });
  }
}
