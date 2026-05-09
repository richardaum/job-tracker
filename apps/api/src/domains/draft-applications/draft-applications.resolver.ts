import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CreateDraftApplicationInput } from "./create-draft-application.input";
import { DraftApplicationType } from "./draft-application.type";
import { DraftApplicationsService } from "./draft-applications.service";
import { UpdateDraftApplicationInput } from "./update-draft-application.input";

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

  @Mutation(() => DeleteMutationPayloadType)
  async deleteApplicationsForDraft(
    @Args("draftId", { type: () => ID }) draftId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.deleteAllLinkedApplications(draftId, user.userId);
    return { success: true, deletedId: draftId };
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteDraftApplication(
    @Args("id", { type: () => ID }) id: string,
    @Args("deleteLinkedApplication", {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    deleteLinkedApplication: boolean,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.delete(id, {
      deleteLinkedApplication,
      userId: user.userId,
    });
    return { success: true, deletedId: id };
  }

  @Mutation(() => DraftApplicationType)
  updateDraftApplication(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDraftApplicationInput,
    @CurrentUser() _user: { userId: string },
  ): Promise<DraftApplicationType> {
    return this.service.update(id, { title: input.title });
  }
}
