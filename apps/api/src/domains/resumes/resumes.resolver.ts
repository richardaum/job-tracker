import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CreateResumeInput } from "./create-resume.input";
import { ResumeType } from "./resume.type";
import { ResumeService } from "./resumes.service";
import { UpdateResumeInput } from "./update-resume.input";

@Resolver(() => ResumeType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class ResumeResolver {
  constructor(private readonly service: ResumeService) {}

  @Query(() => [ResumeType])
  resumes(@CurrentUser() user: { userId: string }): Promise<ResumeType[]> {
    return this.service.findAll(user.userId);
  }

  @Query(() => ResumeType)
  resume(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ResumeType> {
    return this.service.findOne(id, user.userId);
  }

  @Mutation(() => ResumeType)
  createResume(
    @Args("input") input: CreateResumeInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ResumeType> {
    return this.service.create(user.userId, { ...input, userId: user.userId });
  }

  @Mutation(() => ResumeType)
  updateResume(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateResumeInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ResumeType> {
    return this.service.update(id, user.userId, input);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteResume(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.remove(id, user.userId);
    return { success: true, deletedId: id };
  }
}
