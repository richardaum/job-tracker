import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Controller, Param, Req, Sse, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { Observable } from "rxjs";

import {
  FillJobCompleted,
  FillJobFailed,
  FillJobRequested,
  JobMatchStatusChanged,
  SummaryStatusChanged,
} from "./job.events";
import { JobEventBus } from "./job-event.bus";

type FillSsePayload = {
  jobId: string;
  status: AsyncMetadataStatusEnum;
  error: string | null;
};

type MatchSsePayload = { jobId: string; matchId: string; status: string };

type RequestWithUser = Request & { user?: { userId?: string } };

@Controller("jobs")
@UseGuards(JwtAuthGuard)
export class JobsSseController {
  constructor(private readonly eventBus: JobEventBus) {}

  @Sse(":id/stream")
  stream(
    @Param("id") id: string,
    @Req() req: RequestWithUser,
  ): Observable<{
    data: FillSsePayload | MatchSsePayload | { jobId: string; status: string };
    type: string;
  }> {
    const userId = req.user?.userId;

    return new Observable<
      | { data: FillSsePayload; type: "fill_status_changed" }
      | { data: MatchSsePayload; type: "match_status_changed" }
      | {
          data: { jobId: string; status: string };
          type: "summary_status_changed";
        }
    >((observer) => {
      const summaryUnsub = this.eventBus.on(SummaryStatusChanged, (event) => {
        if (event.jobId !== id) return;
        if (event.userId !== userId) return;

        observer.next({
          data: { jobId: id, status: event.status },
          type: "summary_status_changed",
        });
      });

      const fillRequestedUnsub = this.eventBus.on(FillJobRequested, (event) => {
        if (event.jobId !== id) return;
        if (event.userId !== userId) return;
        observer.next({
          data: {
            jobId: id,
            status: AsyncMetadataStatusEnum.PROCESSING,
            error: null,
          },
          type: "fill_status_changed",
        });
      });

      const fillCompletedUnsub = this.eventBus.on(FillJobCompleted, (event) => {
        if (event.jobId !== id) return;
        if (event.userId !== userId) return;
        observer.next({
          data: {
            jobId: id,
            status: AsyncMetadataStatusEnum.COMPLETED,
            error: null,
          },
          type: "fill_status_changed",
        });
      });

      const fillFailedUnsub = this.eventBus.on(FillJobFailed, (event) => {
        if (event.jobId !== id) return;
        if (event.userId !== userId) return;
        observer.next({
          data: {
            jobId: id,
            status: AsyncMetadataStatusEnum.FAILED,
            error: event.error,
          },
          type: "fill_status_changed",
        });
      });

      const matchStatusUnsub = this.eventBus.on(
        JobMatchStatusChanged,
        (event) => {
          if (event.jobId !== id) return;
          if (event.userId !== userId) return;
          observer.next({
            data: { jobId: id, matchId: event.matchId, status: event.status },
            type: "match_status_changed",
          });
        },
      );

      return () => {
        summaryUnsub();
        fillRequestedUnsub();
        fillCompletedUnsub();
        fillFailedUnsub();
        matchStatusUnsub();
      };
    });
  }
}
