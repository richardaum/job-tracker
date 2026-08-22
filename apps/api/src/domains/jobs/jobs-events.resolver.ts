import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { SessionAuthGuard } from "@api/domains/auth/session-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Resolver, Subscription } from "@nestjs/graphql";

import { FillJobStatusChanged, JobMatchStatusChanged, SummaryStatusChanged } from "./job.events";
import { JobEventBus } from "./job-event.bus";
import { JobFillStatusEventType, JobMatchStatusEventType, JobSummaryStatusEventType } from "./job-event.types";
import { JobsRepository } from "./jobs.repository";

@Resolver()
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class JobsEventsResolver {
  constructor(
    private readonly eventBus: JobEventBus,
    private readonly jobsRepo: JobsRepository,
  ) {}

  @Subscription(() => JobSummaryStatusEventType)
  async *jobSummaryStatusChanged(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<JobSummaryStatusEventType> {
    const bus = this.eventBus.forJob(user.userId, jobId);
    for await (const event of bus.eventsOf(SummaryStatusChanged)) {
      const payload: JobSummaryStatusEventType = { jobId: event.jobId, status: event.status };

      if (event.status === AsyncMetadataStatusEnum.Completed) {
        const job = await this.jobsRepo.findOneByIdAndUserId(jobId, user.userId);
        if (job) {
          payload.summary = job.summary;
          payload.summaryMetadata = job.summaryMetadata;
        }
      }

      yield payload;
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
      yield { jobId: event.jobId, matchId: event.matchId, status: event.status };
    }
  }
}
