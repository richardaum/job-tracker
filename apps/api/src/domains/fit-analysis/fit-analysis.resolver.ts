import { ApplicationType } from "@api/domains/applications/application.type";
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

import { FitAnalysisService } from "./fit-analysis.service";
import { FitAnalysisType } from "./fit-analysis.type";
import { GenerateFitInput } from "./generate-fit.input";

@Resolver(() => FitAnalysisType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class FitAnalysisResolver {
  constructor(private readonly service: FitAnalysisService) {}

  @Query(() => FitAnalysisType, { nullable: true })
  async applicationFit(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<FitAnalysisType | null> {
    return this.service.findForApplication(applicationId, user.userId);
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
