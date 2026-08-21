import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { FeatureFlag } from "@api/domains/feature-flags/feature-flag.decorator";
import { FeatureFlagGuard } from "@api/domains/feature-flags/feature-flag.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";

import { AiMessageStreamEventType } from "./ai-chat-event.types";
import { AiChatService } from "./ai-chat.service";
import { AiConversationType } from "./ai-conversation.type";
import { AiMessageType } from "./ai-message.type";
import { AskQuestionPayloadType } from "./ask-question-payload.type";

@Resolver(() => AiConversationType)
@UseGuards(JwtAuthGuard, RolesGuard, FeatureFlagGuard)
@Roles(RoleEnum.User)
@FeatureFlag("ai-chat-enabled")
export class AiChatResolver {
  constructor(private readonly service: AiChatService) {}

  @Query(() => [AiConversationType])
  aiConversations(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<AiConversationType[]> {
    return this.service.listConversations(jobId, user.userId);
  }

  @Query(() => [AiMessageType])
  aiMessages(
    @Args("conversationId", { type: () => ID }) conversationId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<AiMessageType[]> {
    return this.service.listMessages(conversationId, user.userId);
  }

  @Mutation(() => AiConversationType)
  createAiConversation(
    @Args("jobId", { type: () => ID }) jobId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<AiConversationType> {
    return this.service.createConversation(jobId, user.userId);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteAiConversation(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    return this.service.deleteConversation(id, user.userId);
  }

  @Mutation(() => AskQuestionPayloadType)
  async askAiQuestion(
    @Args("conversationId", { type: () => ID }) conversationId: string,
    @Args("content", { type: () => String }) content: string,
    @CurrentUser() user: { userId: string },
  ): Promise<AskQuestionPayloadType> {
    return this.service.askQuestion(conversationId, user.userId, content);
  }

  @Subscription(() => AiMessageStreamEventType)
  aiMessageStreamed(
    @Args("conversationId", { type: () => ID }) conversationId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<AiMessageStreamEventType> {
    return this.service.subscribeStream(conversationId, user.userId);
  }
}
