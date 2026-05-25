import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Resolver, Subscription } from "@nestjs/graphql";

import {
  FillJobCompleted,
  FillJobFailed,
  FillJobRequested,
  JobMatchStatusChanged,
  SummaryStatusChanged,
} from "./job.events";
import { JobEventBus } from "./job-event.bus";
import {
  JobFillStatusEventType,
  JobMatchStatusEventType,
  JobSummaryStatusEventType,
} from "./job-event.types";

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class JobsEventsResolver {
  constructor(private readonly eventBus: JobEventBus) {}

  @Subscription(() => JobSummaryStatusEventType)
  async *jobSummaryStatusChanged(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<JobSummaryStatusEventType> {
    for await (const event of this.eventBus.events()) {
      if (!(event instanceof SummaryStatusChanged)) {
        continue;
      }
      if (event.jobId !== jobId || event.userId !== user.userId) {
        continue;
      }
      yield { jobId: event.jobId, status: event.status };
    }
  }

  @Subscription(() => JobFillStatusEventType)
  async *jobFillStatusChanged(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<JobFillStatusEventType> {
    for await (const event of this.eventBus.events()) {
      if (event instanceof FillJobRequested) {
        if (event.jobId !== jobId || event.userId !== user.userId) {
          continue;
        }
        yield {
          jobId: event.jobId,
          status: AsyncMetadataStatusEnum.PROCESSING,
          error: undefined,
        };
      } else if (event instanceof FillJobCompleted) {
        if (event.jobId !== jobId || event.userId !== user.userId) {
          continue;
        }
        yield {
          jobId: event.jobId,
          status: AsyncMetadataStatusEnum.COMPLETED,
          error: undefined,
        };
      } else if (event instanceof FillJobFailed) {
        if (event.jobId !== jobId || event.userId !== user.userId) {
          continue;
        }
        yield {
          jobId: event.jobId,
          status: AsyncMetadataStatusEnum.FAILED,
          error: event.error,
        };
      }
    }
  }

  @Subscription(() => JobMatchStatusEventType)
  async *jobMatchStatusChanged(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<JobMatchStatusEventType> {
    for await (const event of this.eventBus.events()) {
      if (!(event instanceof JobMatchStatusChanged)) {
        continue;
      }
      if (event.jobId !== jobId || event.userId !== user.userId) {
        continue;
      }
      yield {
        jobId: event.jobId,
        matchId: event.matchId,
        status: event.status,
      };
    }
  }
}
