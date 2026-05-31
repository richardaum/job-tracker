import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { JobType } from "@api/domains/jobs/job.type";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { RoleEnum } from "@api/domains/users/role.enum";
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

import { GenerateMatchInput } from "./generate-match.input";
import { MatchAnalysisService } from "./match-analysis.service";
import { MatchAnalysisType } from "./match-analysis.type";

@Resolver(() => MatchAnalysisType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class MatchAnalysisResolver {
  constructor(private readonly service: MatchAnalysisService) {}

  @Query(() => [MatchAnalysisType])
  async matchAnalyses(
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType[]> {
    return this.service.findAll(user.userId);
  }

  @Query(() => MatchAnalysisType)
  async match(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType> {
    return this.service.findById(id, user.userId);
  }

  @Query(() => MatchAnalysisType, { nullable: true })
  async jobMatch(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<MatchAnalysisType | null> {
    return this.service.findForJob(jobId, user.userId);
  }

  @ResolveField(() => JobType, { nullable: true })
  async job(
    @Parent() matchAnalysis: MatchAnalysisType,
    @CurrentUser() user: { userId: string },
  ) {
    return this.service.findJobById(matchAnalysis.jobId, user.userId);
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
}

@Resolver(() => JobType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
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
