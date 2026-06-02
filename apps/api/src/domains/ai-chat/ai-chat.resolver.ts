import { CurrentUser } from "@api/domains/auth/current-user.decorator";
import { JwtAuthGuard } from "@api/domains/auth/jwt-auth.guard";
import { Roles } from "@api/domains/auth/roles.decorator";
import { RolesGuard } from "@api/domains/auth/roles.guard";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";

import { AiChatEventBus } from "./ai-chat-event.bus";
import { AiMessageStreamEventType } from "./ai-chat-event.types";
import { AiMessageCompleted, AiMessageTokenReceived } from "./ai-chat.events";
import { AiConversationType } from "./ai-conversation.type";
import { AiMessageType } from "./ai-message.type";
import { AiChatService } from "./ai-chat.service";
import { AskQuestionPayloadType } from "./ask-question-payload.type";

@Resolver(() => AiConversationType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class AiChatResolver {
  constructor(
    private readonly service: AiChatService,
    private readonly eventBus: AiChatEventBus,
  ) {}

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
  async *aiMessageStreamed(
    @Args("conversationId", { type: () => ID }) conversationId: string,
    @CurrentUser() user: { userId: string },
  ): AsyncIterable<AiMessageStreamEventType> {
    const bus = this.eventBus.forConversation(user.userId, conversationId);

    const tokenIter = bus.eventsOf(AiMessageTokenReceived)[Symbol.asyncIterator]();
    const completedIter = bus.eventsOf(AiMessageCompleted)[Symbol.asyncIterator]();

    const completedRace = completedIter.next().then((r) => ({ kind: "completed" as const, r }));

    while (true) {
      const result = await Promise.race([
        tokenIter.next().then((r) => ({ kind: "token" as const, r })),
        completedRace,
      ]);

      if (result.kind === "completed") {
        yield {
          conversationId,
          token: null,
          completed: true,
          userMessageId: result.r.value.userMessageId || null,
          aiMessageId: result.r.value.aiMessageId || null,
        } as AiMessageStreamEventType;
        return;
      }

      if (result.r.done) break;

      yield {
        conversationId,
        token: result.r.value.token,
        completed: false,
        userMessageId: null,
        aiMessageId: null,
      } as AiMessageStreamEventType;
    }
  }
}
