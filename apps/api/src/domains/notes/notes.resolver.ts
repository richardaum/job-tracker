import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CreateNoteInput } from "./create-note.input";
import { NoteType } from "./note.type";
import { NoteService } from "./notes.service";
import { UpdateNoteInput } from "./update-note.input";

@Resolver(() => NoteType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class NoteResolver {
  constructor(private readonly service: NoteService) {}

  @Query(() => [NoteType])
  jobNotes(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<NoteType[]> {
    return this.service.listNotes(jobId, user.userId);
  }

  @Mutation(() => NoteType)
  createJobNote(
    @Args("input") input: CreateNoteInput,
    @CurrentUser() user: { userId: string },
  ): Promise<NoteType> {
    return this.service.createNote(user.userId, input);
  }

  @Mutation(() => NoteType)
  updateJobNote(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateNoteInput,
    @CurrentUser() user: { userId: string },
  ): Promise<NoteType> {
    return this.service.updateNote(id, user.userId, input);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteJobNote(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.removeNote(id, user.userId);
    return { success: true, deletedId: id };
  }

  @Query(() => String)
  generateJobNoteWithAI(
    @Args("jobId", { type: () => ID }) jobId: string,
    @Args("note") note: string,
    @CurrentUser() user: { userId: string },
  ): Promise<string> {
    return this.service.generateNoteWithAI(user.userId, jobId, note);
  }
}
