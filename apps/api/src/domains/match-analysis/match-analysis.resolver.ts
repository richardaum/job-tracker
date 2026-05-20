import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DraftJobType } from "@api/domains/draft-jobs/draft-job.type";
import { JobType } from "@api/domains/jobs/job.type";
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

import { GenerateDraftMatchInput } from "./generate-draft-match.input";
import { GenerateMatchInput } from "./generate-match.input";
import { MatchAnalysisService } from "./match-analysis.service";
import { MatchAnalysisType } from "./match-analysis.type";

@Resolver(() => MatchAnalysisType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class MatchAnalysisResolver {
  constructor(private readonly service: MatchAnalysisService) {}

  @Query(() => [MatchAnalysisType])
  async matchAnalyses(
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType[]> {
    return this.service.findAll(user.userId);
  }

  @Query(() => MatchAnalysisType, { nullable: true })
  async match(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType | null> {
    return this.service.findForJob(jobId, user.userId);
  }

  @Query(() => MatchAnalysisType, { nullable: true })
  async draftJobMatch(
    @Args("draftJobId", { type: () => ID }) draftJobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType | null> {
    return this.service.findForDraftJob(draftJobId, user.userId);
  }

  @ResolveField(() => JobType, { nullable: true })
  async job(
    @Parent() matchAnalysis: MatchAnalysisType,
    @CurrentUser() user: { userId: string },
  ) {
    if (!matchAnalysis.jobId) return null;
    return this.service.findJobById(matchAnalysis.jobId, user.userId);
  }

  @ResolveField(() => DraftJobType, { nullable: true })
  async draftJob(
    @Parent() matchAnalysis: MatchAnalysisType,
    @CurrentUser() user: { userId: string },
  ) {
    if (!matchAnalysis.draftJobId) return null;
    return this.service.findDraftJobById(matchAnalysis.draftJobId, user.userId);
  }

  @Mutation(() => MatchAnalysisType)
  async generateJobMatch(
    @Args("input") input: GenerateMatchInput,
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType> {
    return this.service.generate(input.jobId, input.resumeId, user.userId);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteMatchAnalysis(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.remove(id, user.userId);
    return { success: true, deletedId: id };
  }

  @Mutation(() => MatchAnalysisType)
  async generateDraftJobMatch(
    @Args("input") input: GenerateDraftMatchInput,
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType> {
    return this.service.generateForDraft(
      input.draftJobId,
      input.resumeId,
      user.userId,
    );
  }
}

@Resolver(() => JobType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class JobMatchResolver {
  constructor(private readonly service: MatchAnalysisService) {}

  @ResolveField(() => MatchAnalysisType, { nullable: true })
  async match(
    @Parent() job: JobType,
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType | null> {
    return this.service.findForJob(job.id, user.userId);
  }
}

@Resolver(() => DraftJobType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class DraftJobMatchResolver {
  constructor(private readonly service: MatchAnalysisService) {}

  @ResolveField(() => MatchAnalysisType, { nullable: true })
  async match(
    @Parent() draft: DraftJobType,
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType | null> {
    return this.service.findForDraftJob(draft.id, user.userId);
  }
}
