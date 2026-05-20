import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Controller, Param, Req, Sse, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { Observable } from "rxjs";

import { MatchStatusChanged } from "./match-analysis.events";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";

type RequestWithUser = Request & { user?: { userId?: string } };

@Controller("matches")
@UseGuards(JwtAuthGuard)
export class MatchAnalysisSseController {
  constructor(private readonly eventBus: MatchAnalysisEventBus) {}

  @Sse(":id/stream")
  stream(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): Observable<{ data: { matchId: string; status: string }; type: string }> {
    return new Observable<{
      data: { matchId: string; status: string };
      type: string;
    }>((observer) => {
      const handler = (event: MatchStatusChanged) => {
        if (event.matchId !== id) return;
        if (event.userId !== req.user?.userId) return;

        observer.next({
          data: { matchId: id, status: event.status },
          type: "match_status_changed",
        });
      };

      return this.eventBus.on(MatchStatusChanged, handler);
    });
  }
}
