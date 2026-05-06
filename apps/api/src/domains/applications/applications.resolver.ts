import { ApplicationAiDraftType } from "@api/domains/application-ai/application-ai-draft.type";
import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
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
import { CreateApplicationWithAIInput } from "./create-application-with-ai.input";
import { SalaryPeriodEnum } from "./salary-period.enum";
import { UpdateApplicationInput } from "./update-application.input";
import { UpdateApplicationStageEventInput } from "./update-application-stage-event.input";

@Resolver(() => ApplicationType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ApplicationResolver {
  constructor(private readonly service: ApplicationService) {}

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
  ): Promise<ApplicationType[]> {
    return this.service.findAll(user.userId, filter, company);
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

  @Mutation(() => ApplicationType)
  createApplicationWithAI(
    @Args("input") input: CreateApplicationWithAIInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.createWithAI(user.userId, input);
  }

  @Query(() => ApplicationAiDraftType)
  generateApplicationDraftWithAI(
    @Args("input") input: CreateApplicationWithAIInput,
  ): Promise<ApplicationAiDraftType> {
    return this.service.generateDraftWithAI(input);
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
  removeApplicationTag(
    @Args("id", { type: () => ID }) id: string,
    @Args("tag") tag: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.removeTag(id, user.userId, tag);
  }

  @Mutation(() => Boolean)
  async deleteApplication(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.service.remove(id, user.userId);
    return true;
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

  @Mutation(() => Boolean)
  async deleteApplicationStageEvent(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.service.removeStageEvent(id, user.userId);
    return true;
  }
}
