import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";

import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { CreateNoteInput } from "./create-note.input";
import { NoteType } from "./note.type";
import { NoteService } from "./notes.service";
import { UpdateNoteInput } from "./update-note.input";

@Resolver(() => NoteType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class NoteResolver {
  constructor(private readonly service: NoteService) {}

  @Query(() => [NoteType])
  applicationNotes(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<NoteType[]> {
    return this.service.listNotes(applicationId, user.userId);
  }

  @Mutation(() => NoteType)
  createApplicationNote(
    @Args("input") input: CreateNoteInput,
    @CurrentUser() user: { userId: string },
  ): Promise<NoteType> {
    return this.service.createNote(user.userId, input);
  }

  @Mutation(() => NoteType)
  updateApplicationNote(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateNoteInput,
    @CurrentUser() user: { userId: string },
  ): Promise<NoteType> {
    return this.service.updateNote(id, user.userId, input);
  }

  @Mutation(() => Boolean)
  async deleteApplicationNote(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.service.removeNote(id, user.userId);
    return true;
  }

  @Mutation(() => String)
  generateApplicationNoteWithAI(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @Args("note") note: string,
    @CurrentUser() user: { userId: string },
  ): Promise<string> {
    return this.service.generateNoteWithAI(user.userId, applicationId, note);
  }
}
