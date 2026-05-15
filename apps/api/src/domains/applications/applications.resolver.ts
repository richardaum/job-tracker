import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DraftApplicationType } from "@api/domains/draft-applications/draft-application.type";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { UseGuards } from "@nestjs/common";
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";

import { ApplicationType } from "./application.type";
import { ApplicationQuickFilterEnum } from "./application-quick-filter.enum";
import { ApplicationSalaryType } from "./application-salary.type";
import { ApplicationStageEventType } from "./application-stage-event.type";
import type { Application } from "./applications.schema";
import { ApplicationService } from "./applications.service";
import { CreateApplicationInput } from "./create-application.input";
import { CreateApplicationStageEventInput } from "./create-application-stage-event.input";
import { SalaryPeriodEnum } from "./salary-period.enum";
import { SummaryService } from "./summary/summary.service";
import { UpdateApplicationInput } from "./update-application.input";
import { UpdateApplicationStageEventInput } from "./update-application-stage-event.input";

@Resolver(() => ApplicationType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ApplicationResolver {
  constructor(
    private readonly service: ApplicationService,
    private readonly summaryService: SummaryService,
  ) {}

  @ResolveField(() => ApplicationSalaryType)
  salary(@Parent() app: Application): ApplicationSalaryType {
    return {
      minCents: app.salaryMinCents ?? null,
      maxCents: app.salaryMaxCents ?? null,
      currency: app.salaryCurrency ?? null,
      period:
        app.salaryPeriod != null
          ? (app.salaryPeriod as SalaryPeriodEnum)
          : null,
    };
  }

  @Query(() => [ApplicationType])
  applications(
    @CurrentUser() user: { userId: string },
    @Args("filter", { type: () => ApplicationQuickFilterEnum, nullable: true })
    filter?: ApplicationQuickFilterEnum,
    @Args("company", { type: () => String, nullable: true }) company?: string,
    @Args("runId", { type: () => ID, nullable: true }) runId?: string,
  ): Promise<ApplicationType[]> {
    return this.service.findAll(user.userId, filter, company, runId);
  }

  @Query(() => ApplicationType)
  application(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.findOne(id, user.userId);
  }

  @Mutation(() => ApplicationType)
  createApplication(
    @Args("input") input: CreateApplicationInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.create(user.userId, input);
  }

  @Mutation(() => DraftApplicationType)
  async createApplicationWithAI(
    @Args("draftId", { type: () => ID }) draftId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DraftApplicationType> {
    return this.service.createApplicationWithAI(user.userId, draftId);
  }

  @Query(() => String, { nullable: true })
  generateApplicationLocationWithAI(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<string | null> {
    return this.service.inferApplicationLocation(user.userId, applicationId);
  }

  @Query(() => String, { nullable: true })
  generateApplicationWorkRegionWithAI(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<string | null> {
    return this.service.inferApplicationWorkRegion(user.userId, applicationId);
  }

  @Query(() => String)
  generateCompanyDescription(
    @Args("companyName") companyName: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.generateCompanyDescription(user.userId, {
      companyName,
    });
  }

  @Mutation(() => ApplicationType)
  updateApplication(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateApplicationInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.update(id, user.userId, input);
  }

  @Mutation(() => ApplicationType)
  generateApplicationSummary(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    void this.summaryService.generateSummary(applicationId, user.userId);
    return this.service.findOne(applicationId, user.userId);
  }

  @Mutation(() => ApplicationType)
  removeApplicationTag(
    @Args("id", { type: () => ID }) id: string,
    @Args("tag") tag: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.removeTag(id, user.userId, tag);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteApplication(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.remove(id, user.userId);
    return { success: true, deletedId: id };
  }

  @Query(() => [ApplicationStageEventType])
  applicationStageEvents(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationStageEventType[]> {
    return this.service.listStageEvents(applicationId, user.userId);
  }

  @Mutation(() => ApplicationStageEventType)
  createApplicationStageEvent(
    @Args("input") input: CreateApplicationStageEventInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationStageEventType> {
    return this.service.createStageEvent(user.userId, input);
  }

  @Mutation(() => ApplicationStageEventType)
  updateApplicationStageEvent(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateApplicationStageEventInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationStageEventType> {
    return this.service.updateStageEvent(id, user.userId, input);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteApplicationStageEvent(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.removeStageEvent(id, user.userId);
    return { success: true, deletedId: id };
  }
}
