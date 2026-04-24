import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ApplicationQuickFilterEnum } from "./application-quick-filter.enum";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { ApplicationService } from "./applications.service";
import { ApplicationType } from "./application.type";
import { CreateApplicationInput } from "./create-application.input";
import { UpdateApplicationInput } from "./update-application.input";
import { ApplicationStageEventType } from "./application-stage-event.type";
import { CreateApplicationStageEventInput } from "./create-application-stage-event.input";
import { ApplicationNoteType } from "./application-note.type";
import { CreateApplicationNoteInput } from "./create-application-note.input";
import { UpdateApplicationNoteInput } from "./update-application-note.input";
import { UpdateApplicationStageEventInput } from "./update-application-stage-event.input";

@Resolver(() => ApplicationType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("user")
export class ApplicationResolver {
  constructor(private readonly service: ApplicationService) {}

  @Query(() => [ApplicationType])
  applications(
    @CurrentUser() user: { userId: string },
    @Args("filter", { type: () => ApplicationQuickFilterEnum, nullable: true })
    filter?: ApplicationQuickFilterEnum,
  ): Promise<ApplicationType[]> {
    return this.service.findAll(user.userId, filter);
  }

  @Query(() => ApplicationType)
  application(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.findOne(id, user.userId);
  }

  @Mutation(() => ApplicationType)
  createApplication(
    @Args("input") input: CreateApplicationInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.create(user.userId, input);
  }

  @Mutation(() => ApplicationType)
  updateApplication(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateApplicationInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.update(id, user.userId, input);
  }

  @Mutation(() => ApplicationType)
  removeApplicationTag(
    @Args("id", { type: () => ID }) id: string,
    @Args("tag") tag: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationType> {
    return this.service.removeTag(id, user.userId, tag);
  }

  @Mutation(() => Boolean)
  async deleteApplication(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<boolean> {
    await this.service.remove(id, user.userId);
    return true;
  }

  @Query(() => [ApplicationStageEventType])
  applicationStageEvents(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationStageEventType[]> {
    return this.service.listStageEvents(applicationId, user.userId);
  }

  @Mutation(() => ApplicationStageEventType)
  createApplicationStageEvent(
    @Args("input") input: CreateApplicationStageEventInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationStageEventType> {
    return this.service.createStageEvent(user.userId, input);
  }

  @Mutation(() => ApplicationStageEventType)
  updateApplicationStageEvent(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateApplicationStageEventInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationStageEventType> {
    return this.service.updateStageEvent(id, user.userId, input);
  }

  @Query(() => [ApplicationNoteType])
  applicationNotes(
    @Args("applicationId", { type: () => ID }) applicationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationNoteType[]> {
    return this.service.listNotes(applicationId, user.userId);
  }

  @Mutation(() => ApplicationNoteType)
  createApplicationNote(
    @Args("input") input: CreateApplicationNoteInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationNoteType> {
    return this.service.createNote(user.userId, input);
  }

  @Mutation(() => ApplicationNoteType)
  updateApplicationNote(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateApplicationNoteInput,
    @CurrentUser() user: { userId: string },
  ): Promise<ApplicationNoteType> {
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
}
