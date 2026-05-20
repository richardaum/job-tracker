import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CreateDraftJobInput } from "./create-draft-job.input";
import { DraftJobType } from "./draft-job.type";
import { DraftJobsService } from "./draft-jobs.service";
import { UpdateDraftJobInput } from "./update-draft-job.input";

@Resolver(() => DraftJobType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class DraftJobsResolver {
  constructor(private readonly service: DraftJobsService) {}

  @Query(() => [DraftJobType])
  draftJobs(@CurrentUser() user: { userId: string }): Promise<DraftJobType[]> {
    return this.service.findAll(user.userId);
  }

  @Query(() => DraftJobType)
  draftJob(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DraftJobType> {
    return this.service.findOne(id, user.userId);
  }

  @Mutation(() => DraftJobType)
  createDraftJob(
    @Args("input") input: CreateDraftJobInput,
    @CurrentUser() user: { userId: string },
  ): Promise<DraftJobType> {
    return this.service.create(input, user.userId);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteJobsForDraft(
    @Args("draftId", { type: () => ID }) draftId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.deleteAllLinkedJobs(draftId, user.userId);
    return { success: true, deletedId: draftId };
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteDraftJob(
    @Args("id", { type: () => ID }) id: string,
    @Args("deleteLinkedJob", {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    deleteLinkedJob: boolean,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.delete(id, { deleteLinkedJob, userId: user.userId });
    return { success: true, deletedId: id };
  }

  @Mutation(() => DraftJobType)
  updateDraftJob(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateDraftJobInput,
    @CurrentUser() user: { userId: string },
  ): Promise<DraftJobType> {
    return this.service.update(id, user.userId, { title: input.title });
  }
}
