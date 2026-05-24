import { JobMatchStatusChanged } from "@api/domains/jobs/job.events";
import { JobEventBus } from "@api/domains/jobs/job-event.bus";
import { Injectable, OnModuleInit } from "@nestjs/common";

import { MatchStatusChanged } from "./match-analysis.events";
import { MatchAnalysisEventBus } from "./match-analysis-event.bus";

/** Forwards match lifecycle events onto the job SSE stream (one endpoint per job). */
@Injectable()
export class MatchStatusJobStreamListener implements OnModuleInit {
  constructor(
    private readonly matchEventBus: MatchAnalysisEventBus,
    private readonly jobEventBus: JobEventBus,
  ) {}

  onModuleInit(): void {
    this.matchEventBus.on(MatchStatusChanged, (event) => {
      this.jobEventBus.emit(
        new JobMatchStatusChanged(
          event.jobId,
          event.userId,
          event.matchId,
          event.status,
        ),
      );
    });
  }
}
