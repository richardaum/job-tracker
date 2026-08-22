import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { SessionAuthGuard } from "@api/domains/auth/session-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CreateJobInput } from "./create-job.input";
import { CreateJobStageEventInput } from "./create-job-stage-event.input";
import { JobDuplicateService } from "./job-duplicate.service";
import { JobType } from "./job.type";
import { FilterCountType } from "./filter-count.type";
import { JobAutomaticFillService } from "./job-automatic-fill.service";
import { ApplicationQuickFilterEnum } from "./job-quick-filter.enum";
import { JobStageEventType } from "./job-stage-event.type";
import { JobsListQuery } from "./jobs-list.query";
import { JobsService } from "./jobs.service";
import { JobSummaryService } from "./summary/job-summary.service";
import { UpdateJobInput } from "./update-job.input";
import { UpdateJobStageEventInput } from "./update-job-stage-event.input";

@Resolver(() => JobType)
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class JobsResolver {
  constructor(
    private readonly service: JobsService,
    private readonly fillService: JobAutomaticFillService,
    private readonly summaryService: JobSummaryService,
    private readonly duplicateService: JobDuplicateService,
    private readonly jobsListQuery: JobsListQuery,
  ) {}

  @Query(() => [JobType])
  jobs(
    @CurrentUser() user: { userId: string },
    @Args("filter", { type: () => ApplicationQuickFilterEnum, nullable: true })
    filter?: ApplicationQuickFilterEnum,
    @Args("company", { type: () => String, nullable: true }) company?: string,
    @Args("runId", { type: () => ID, nullable: true }) runId?: string,
  ): Promise<JobType[]> {
    return this.service.findAll(user.userId, filter, company, runId);
  }

  @Query(() => [FilterCountType])
  quickFilterCounts(
    @CurrentUser() user: { userId: string },
    @Args("company", { type: () => String, nullable: true }) company?: string,
    @Args("runId", { type: () => ID, nullable: true }) runId?: string,
  ): Promise<FilterCountType[]> {
    return this.jobsListQuery.countByQuickFilter(user.userId, company, runId);
  }

  @Query(() => JobType)
  job(@Args("id", { type: () => ID }) id: string, @CurrentUser() user: { userId: string }): Promise<JobType> {
    return this.service.findOne(id, user.userId);
  }

  @Mutation(() => JobType)
  createJob(@Args("input") input: CreateJobInput, @CurrentUser() user: { userId: string }): Promise<JobType> {
    return this.service.create(user.userId, input);
  }

  @Mutation(() => JobType)
  fillJobAutomatically(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<JobType> {
    return this.fillService.fillJobAutomatically(user.userId, jobId);
  }

  @Query(() => String, { nullable: true })
  generateJobLocationWithAI(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<string | null> {
    return this.service.inferJobLocation(user.userId, jobId);
  }

  @Query(() => String, { nullable: true })
  generateJobWorkRegionWithAI(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<string | null> {
    return this.service.inferJobWorkRegion(user.userId, jobId);
  }

  @Query(() => String)
  generateCompanyDescription(@Args("companyName") companyName: string, @CurrentUser() user: { userId: string }) {
    return this.service.generateCompanyDescription(user.userId, { companyName });
  }

  @Mutation(() => JobType)
  updateJob(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateJobInput,
    @CurrentUser() user: { userId: string },
  ): Promise<JobType> {
    return this.service.update(id, user.userId, input);
  }

  @Mutation(() => JobType)
  async requestJobSummary(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<JobType> {
    await this.summaryService.requestSummary(jobId, user.userId);
    return this.service.findOne(jobId, user.userId);
  }

  @Mutation(() => JobType)
  removeJobTag(
    @Args("id", { type: () => ID }) id: string,
    @Args("tag") tag: string,
    @CurrentUser() user: { userId: string },
  ): Promise<JobType> {
    return this.service.removeTag(id, user.userId, tag);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteJob(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.remove(id, user.userId);
    return { success: true, deletedId: id };
  }

  @Query(() => Boolean)
  isJobDuplicate(
    @Args("company", { type: () => String }) company: string,
    @Args("title", { type: () => String }) title: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    return this.duplicateService.checkDuplicate(company, title, user.userId);
  }

  @Query(() => [JobStageEventType])
  jobStageEvents(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<JobStageEventType[]> {
    return this.service.listStageEvents(jobId, user.userId);
  }

  @Mutation(() => JobStageEventType)
  createJobStageEvent(
    @Args("input") input: CreateJobStageEventInput,
    @CurrentUser() user: { userId: string },
  ): Promise<JobStageEventType> {
    return this.service.createStageEvent(user.userId, input);
  }

  @Mutation(() => JobStageEventType)
  updateJobStageEvent(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateJobStageEventInput,
    @CurrentUser() user: { userId: string },
  ): Promise<JobStageEventType> {
    return this.service.updateStageEvent(id, user.userId, input);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteJobStageEvent(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.removeStageEvent(id, user.userId);
    return { success: true, deletedId: id };
  }
}
