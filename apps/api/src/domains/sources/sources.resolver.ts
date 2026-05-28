import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { PlanService } from "@api/domains/sources/plan.service";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from "@nestjs/graphql";

import { CreateSourceRunInput } from "./create-source-run.input";
import { CreateSourceTemplateInput } from "./create-source-template.input";
import { SourceProfileType } from "./source-profile.type";
import { SourceRunType } from "./source-run.type";
import { SourceRunEvent } from "./source-run-event.type";
import { SourceRunStatusEnum } from "./source-run-status.enum";
import { SourceTemplateType } from "./source-template.type";
import { SourceRunReported } from "./sources.events";
import { SourcesService } from "./sources.service";
import { SourcesEventBus } from "./sources-event.bus";
import { UpdateSourceRunInput } from "./update-source-run.input";
import { UpdateSourceTemplateInput } from "./update-source-template.input";

type SourceRunEventsSubscriptionRoot = { sourceRunEvents: SourceRunEvent };

@Resolver(() => SourceProfileType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class SourcesResolver {
  constructor(
    private readonly service: SourcesService,
    private readonly planService: PlanService,
    private readonly eventBus: SourcesEventBus,
  ) {}

  @Query(() => [SourceRunType])
  sourceRuns(
    @CurrentUser() user: { userId: string },
  ): Promise<SourceRunType[]> {
    return this.service.listSourceRuns(user.userId);
  }

  @Query(() => [SourceTemplateType])
  sourceTemplates(
    @CurrentUser() user: { userId: string },
  ): Promise<SourceTemplateType[]> {
    return this.service.listSourceTemplates(user.userId);
  }

  @Query(() => [SourceTemplateType])
  sourceTemplatesForSourceProfile(
    @CurrentUser() user: { userId: string },
    @Args("sourceProfileId") sourceProfileId: string,
  ): Promise<SourceTemplateType[]> {
    return this.service.listSourceTemplatesForSourceProfile(
      user.userId,
      sourceProfileId,
    );
  }

  @Query(() => SourceTemplateType)
  sourceTemplate(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<SourceTemplateType> {
    return this.service.getSourceTemplate(user.userId, id);
  }

  @Query(() => [SourceProfileType])
  async sourceProfiles(
    @CurrentUser() user: { userId: string },
    @Args("onlyWithSourceTemplate", {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    onlyWithSourceTemplate: boolean,
  ): Promise<SourceProfileType[]> {
    const all = await this.planService.listSourceProfileDescriptors();
    if (!onlyWithSourceTemplate) {
      return all;
    }
    const templates = await this.service.listSourceTemplates(user.userId);
    const sourceProfileIds = new Set(
      templates.map((template) => template.sourceProfileId),
    );
    return all
      .filter((row) => sourceProfileIds.has(row.sourceProfileId))
      .map((row) => ({
        ...row,
        templates: templates.filter(
          (template) => template.sourceProfileId === row.sourceProfileId,
        ),
      }));
  }

  @ResolveField(() => [SourceTemplateType])
  templates(
    @Parent() sourceProfile: SourceProfileType,
    @CurrentUser() user: { userId: string },
  ): Promise<SourceTemplateType[]> | SourceTemplateType[] {
    if (sourceProfile.templates) return sourceProfile.templates;
    return this.service.listSourceTemplatesForSourceProfile(
      user.userId,
      sourceProfile.sourceProfileId,
    );
  }

  @Mutation(() => SourceRunType)
  createSourceRun(
    @Args("input") input: CreateSourceRunInput,
    @CurrentUser() user: { userId: string },
  ): Promise<SourceRunType> {
    return this.service.createSourceRun(user.userId, input.sourceProfileId);
  }

  @Mutation(() => SourceTemplateType)
  createSourceTemplate(
    @Args("input") input: CreateSourceTemplateInput,
    @CurrentUser() user: { userId: string },
  ): Promise<SourceTemplateType> {
    return this.service.createSourceTemplate(user.userId, input);
  }

  @Mutation(() => SourceRunType)
  rerunSourceTemplate(
    @Args("templateId", { type: () => ID }) templateId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<SourceRunType> {
    return this.service.rerunSourceTemplate(user.userId, templateId);
  }

  @Mutation(() => SourceTemplateType)
  updateSourceTemplate(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateSourceTemplateInput,
    @CurrentUser() user: { userId: string },
  ): Promise<SourceTemplateType> {
    return this.service.updateSourceTemplate(user.userId, id, {
      scheduleCron: input.scheduleCron,
      scheduleEnabled: input.scheduleEnabled,
      surfaceUrl: input.surfaceUrl,
    });
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteSourceTemplate(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.deleteSourceTemplate(user.userId, id);
    return { success: true, deletedId: id };
  }

  @Mutation(() => SourceRunType)
  updateSourceRun(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateSourceRunInput,
    @CurrentUser() user: { userId: string },
  ): Promise<SourceRunType> {
    return this.service.updateSourceRunSurfaceUrl(
      user.userId,
      id,
      input.surfaceUrl,
    );
  }

  @Mutation(() => Int)
  async detachJobsFromSourceRun(
    @Args("sourceRunId", { type: () => ID }) sourceRunId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<number> {
    return this.service.detachJobsFromSourceRun(user.userId, sourceRunId);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteSourceRun(
    @Args("id", { type: () => ID }) id: string,
    @Args("deleteJobs", {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    deleteJobs: boolean,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.deleteSourceRun(user.userId, id, { deleteJobs });
    return { success: true, deletedId: id };
  }

  @Mutation(() => Boolean)
  async clearSourceRuns(
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.service.clearSourceRuns(user.userId);
    return true;
  }

  @Mutation(() => SourceRunType)
  updateSourceRunStatus(
    @Args("id", { type: () => ID }) id: string,
    @Args("status", { type: () => SourceRunStatusEnum })
    status: SourceRunStatusEnum,
    @CurrentUser() user: { userId: string },
  ): Promise<SourceRunType> {
    return this.service.updateSourceRunStatus(user.userId, id, status);
  }

  @Subscription(() => SourceRunEvent)
  async *sourceRunEvents(
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<SourceRunEventsSubscriptionRoot> {
    const bus = this.eventBus.forUser(user.userId);
    for await (const event of bus.eventsOf(SourceRunReported)) {
      yield { sourceRunEvents: event.payload };
    }
  }
}
