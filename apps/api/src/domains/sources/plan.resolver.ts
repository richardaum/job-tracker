import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { CreatePlanInput } from "./create-plan.input";
import { PlanService } from "./plan.service";
import { PlanType } from "./plan.type";
import { SourceTemplateType } from "./source-template.type";
import { SourcesService } from "./sources.service";
import { UpdatePlanInput } from "./update-plan.input";

@Resolver(() => PlanType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class PlanResolver {
  constructor(
    private readonly service: PlanService,
    private readonly sourcesService: SourcesService,
  ) {}

  @Query(() => [PlanType])
  plans(@CurrentUser() user: { userId: string }): Promise<PlanType[]> {
    return this.service.findAll(user.userId);
  }

  @Query(() => PlanType, { nullable: true })
  plan(@Args("id", { type: () => ID }) id: string): Promise<PlanType | null> {
    return this.service.findById(id).catch(() => null);
  }

  @ResolveField(() => [SourceTemplateType])
  async templates(@Parent() plan: PlanType, @CurrentUser() user: { userId: string }): Promise<SourceTemplateType[]> {
    return this.sourcesService.listTemplatesForPlan(user.userId, plan.id);
  }

  @Mutation(() => PlanType)
  createPlan(@Args("input") input: CreatePlanInput, @CurrentUser() user: { userId: string }): Promise<PlanType> {
    return this.service.create(input, user.userId);
  }

  @Mutation(() => PlanType)
  updatePlan(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdatePlanInput,
    @CurrentUser() user: { userId: string },
  ): Promise<PlanType> {
    return this.service.update(id, input, user.userId);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deletePlan(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.delete(id, user.userId);
    return { success: true, deletedId: id };
  }
}
