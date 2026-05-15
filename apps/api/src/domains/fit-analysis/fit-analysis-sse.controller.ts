import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Controller, Param, Req, Sse, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { Observable } from "rxjs";

import {
  FitAnalysisEventBus,
  type FitStatusChangedEvent,
} from "./fit-analysis-event.bus";

type RequestWithUser = Request & { user?: { userId?: string } };

@Controller("fits")
@UseGuards(JwtAuthGuard)
export class FitAnalysisSseController {
  constructor(private readonly eventBus: FitAnalysisEventBus) {}

  @Sse(":id/stream")
  stream(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): Observable<{ data: { fitId: string; status: string }; type: string }> {
    return new Observable<{
      data: { fitId: string; status: string };
      type: string;
    }>((observer) => {
      const handler = (event: FitStatusChangedEvent) => {
        if (event.fitId !== id) return;
        if (event.userId !== req.user?.userId) return;

        observer.next({
          data: { fitId: id, status: event.status },
          type: "fit_status_changed",
        });
      };

      this.eventBus.onFitStatusChanged(handler);

      return () => {
        this.eventBus.removeFitStatusChangedListener(handler);
      };
    });
  }
}
