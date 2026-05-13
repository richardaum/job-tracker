import { ApplicationType } from "@api/domains/applications/application.type";
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

import { FitAnalysisService } from "./fit-analysis.service";
import { FitAnalysisType } from "./fit-analysis.type";
import { GenerateDraftFitInput } from "./generate-draft-fit.input";
import { GenerateFitInput } from "./generate-fit.input";

@Resolver(() => FitAnalysisType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class FitAnalysisResolver {
  constructor(private readonly service: FitAnalysisService) {}

  @Query(() => [FitAnalysisType])
  async fitAnalyses(
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType[]> {
    return this.service.findAll(user.userId);
  }

  @Query(() => FitAnalysisType, { nullable: true })
  async fit(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType | null> {
    return this.service.findById(id, user.userId);
  }

  @Query(() => FitAnalysisType, { nullable: true })
  async applicationFit(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType | null> {
    return this.service.findForApplication(applicationId, user.userId);
  }

  @Query(() => FitAnalysisType, { nullable: true })
  async draftApplicationFit(
    @Args("draftApplicationId", { type: () => ID }) draftApplicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType | null> {
    return this.service.findForDraftApplication(
      draftApplicationId,
      user.userId,
    );
  }

  @ResolveField(() => ApplicationType, { nullable: true })
  async application(
    @Parent() fit: FitAnalysisType,
    @CurrentUser() user: { userId: string },
  ) {
    if (!fit.applicationId) return null;
    return this.service.findApplicationById(fit.applicationId, user.userId);
  }

  @ResolveField(() => DraftApplicationType, { nullable: true })
  async draftApplication(
    @Parent() fit: FitAnalysisType,
    @CurrentUser() user: { userId: string },
  ) {
    if (!fit.draftApplicationId) return null;
    return this.service.findDraftApplicationById(
      fit.draftApplicationId,
      user.userId,
    );
  }

  @Mutation(() => FitAnalysisType)
  async generateApplicationFit(
    @Args("input") input: GenerateFitInput,
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType> {
    return this.service.generate(
      input.applicationId,
      input.resumeId,
      user.userId,
    );
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteFitAnalysis(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.remove(id, user.userId);
    return { success: true, deletedId: id };
  }

  @Mutation(() => FitAnalysisType)
  async generateDraftApplicationFit(
    @Args("input") input: GenerateDraftFitInput,
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType> {
    return this.service.generateForDraft(
      input.draftApplicationId,
      input.resumeId,
      user.userId,
    );
  }
}

@Resolver(() => ApplicationType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ApplicationFitResolver {
  constructor(private readonly service: FitAnalysisService) {}

  @ResolveField(() => FitAnalysisType, { nullable: true })
  async fit(
    @Parent() application: ApplicationType,
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType | null> {
    return this.service.findForApplication(application.id, user.userId);
  }
}

@Resolver(() => DraftApplicationType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class DraftApplicationFitResolver {
  constructor(private readonly service: FitAnalysisService) {}

  @ResolveField(() => FitAnalysisType, { nullable: true })
  async fit(
    @Parent() draft: DraftApplicationType,
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType | null> {
    return this.service.findForDraftApplication(draft.id, user.userId);
  }
}
