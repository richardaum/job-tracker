import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CreateDraftApplicationInput } from "./create-draft-application.input";
import { DraftApplicationType } from "./draft-application.type";
import { DraftApplicationsService } from "./draft-applications.service";

@Resolver(() => DraftApplicationType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class DraftApplicationsResolver {
  constructor(private readonly service: DraftApplicationsService) {}

  @Query(() => [DraftApplicationType])
  draftApplications(
    @CurrentUser() _user: { userId: string },
  ): Promise<DraftApplicationType[]> {
    return this.service.findAll();
  }

  @Query(() => DraftApplicationType)
  draftApplication(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() _user: { userId: string },
  ): Promise<DraftApplicationType> {
    return this.service.findOne(id);
  }

  @Mutation(() => DraftApplicationType)
  createDraftApplication(
    @Args("input") input: CreateDraftApplicationInput,
    @CurrentUser() _user: { userId: string },
  ): Promise<DraftApplicationType> {
    return this.service.create(input);
  }

  @Mutation(() => Boolean)
  async deleteDraftApplication(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() _user: { userId: string },
  ): Promise<boolean> {
    await this.service.delete(id);
    return true;
  }
}
