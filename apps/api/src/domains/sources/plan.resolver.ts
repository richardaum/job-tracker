import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CreatePlanInput } from "./create-plan.input";
import { PlanService } from "./plan.service";
import { PlanType } from "./plan.type";
import { UpdatePlanInput } from "./update-plan.input";

@Resolver(() => PlanType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class PlanResolver {
  constructor(private readonly service: PlanService) {}

  @Query(() => [PlanType])
  plans(): Promise<PlanType[]> {
    return this.service.findAll();
  }

  @Query(() => PlanType, { nullable: true })
  plan(
    @Args("sourceProfileId") sourceProfileId: string,
  ): Promise<PlanType | null> {
    return this.service.findBySourceProfileId(sourceProfileId);
  }

  @Mutation(() => PlanType)
  @Roles(RoleEnum.Admin)
  createPlan(@Args("input") input: CreatePlanInput): Promise<PlanType> {
    return this.service.create(input);
  }

  @Mutation(() => PlanType)
  @Roles(RoleEnum.Admin)
  updatePlan(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdatePlanInput,
  ): Promise<PlanType> {
    return this.service.update(id, input);
  }

  @Mutation(() => DeleteMutationPayloadType)
  @Roles(RoleEnum.Admin)
  async deletePlan(
    @Args("id", { type: () => ID }) id: string,
  ): Promise<DeleteMutationPayloadType> {
    await this.service.delete(id);
    return { success: true, deletedId: id };
  }
}
