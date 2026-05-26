import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Resolver, Subscription } from "@nestjs/graphql";

import {
  FillJobStatusChanged,
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
    const bus = this.eventBus.forJob(user.userId, jobId);
    for await (const event of bus.eventsOf(SummaryStatusChanged)) {
      yield { jobId: event.jobId, status: event.status };
    }
  }

  @Subscription(() => JobFillStatusEventType)
  async *jobFillStatusChanged(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<JobFillStatusEventType> {
    const bus = this.eventBus.forJob(user.userId, jobId);
    for await (const event of bus.eventsOf(FillJobStatusChanged)) {
      yield { jobId: event.jobId, status: event.status, error: event.error };
    }
  }

  @Subscription(() => JobMatchStatusEventType)
  async *jobMatchStatusChanged(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<JobMatchStatusEventType> {
    const bus = this.eventBus.forJob(user.userId, jobId);
    for await (const event of bus.eventsOf(JobMatchStatusChanged)) {
      yield {
        jobId: event.jobId,
        matchId: event.matchId,
        status: event.status,
      };
    }
  }
}
