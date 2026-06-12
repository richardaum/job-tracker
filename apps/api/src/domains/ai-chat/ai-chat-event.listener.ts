import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { AiChatPubSub } from "./ai-chat.pubsub";
import { AiMessageRoleEnum } from "./ai-message-role.enum";
import { AiChatSubEventEnum } from "./ai-chat-sub-event.enum";
import { AiMessageStreamPhaseEnum } from "./ai-message-stream-phase.enum";
import { AiChatGenerationService } from "./ai-chat-generation.service";
import { AiChatRepository } from "./ai-chat.repository";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";

@Injectable()
export class AiChatEventListener implements OnModuleInit {
  private readonly logger = new Logger(AiChatEventListener.name);

  constructor(
    private readonly pubSub: AiChatPubSub,
    private readonly generationService: AiChatGenerationService,
    private readonly repo: AiChatRepository,
  ) {}

  onModuleInit(): void {
    (async () => {
      for await (const event of this.pubSub.asyncIterableIterator(AiChatSubEventEnum.AiChatRequested)) {
        void this.handleChatRequested(event);
      }
    })();

    this.logger.log(`Listening for ${AiChatSubEventEnum.AiChatRequested} events`);
  }

  private async handleChatRequested(event: {
    conversationId: string;
    userId: string;
    jobId: string;
    content: string;
    userMessageId: string;
  }): Promise<void> {
    const { conversationId, userId, jobId, content, userMessageId } = event;

    try {
      const fullContent = await this.generationService.generateAnswer(conversationId, userId, jobId, content);

      if (!fullContent) {
        throw new Error("AI returned no content");
      }

      const aiMessage = await this.repo.createMessage({
        conversationId,
        role: AiMessageRoleEnum.Assistant,
        content: fullContent,
      });

      // Update generating status to Completed
      await this.repo.updateGeneratingStatus(conversationId, {
        status: AsyncMetadataStatusEnum.Completed,
        timestamp: new Date(),
      });

      this.logger.log(`AI message persisted: conversationId=${conversationId}, aiMessageId=${aiMessage.id}`);

      await this.generateTitleIfFirstMessage(conversationId, userId, content);

      await this.pubSub.publish(AiChatSubEventEnum.AiMessageStreamed, {
        conversationId,
        phase: AiMessageStreamPhaseEnum.Complete,
        userMessageId,
        aiMessageId: aiMessage.id,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`AI generation failed: conversationId=${conversationId}, error=${errorMessage}`);

      await this.repo.updateGeneratingStatus(conversationId, {
        status: AsyncMetadataStatusEnum.Failed,
        error: errorMessage,
        timestamp: new Date(),
      });

      await this.pubSub.publish(AiChatSubEventEnum.AiMessageStreamed, {
        conversationId,
        phase: AiMessageStreamPhaseEnum.Failed,
        error: errorMessage,
      });
    }
  }

  private async generateTitleIfFirstMessage(conversationId: string, userId: string, content: string): Promise<void> {
    const conversation = await this.repo.findConversationById(conversationId, userId);
    if (!conversation || (conversation.title !== "New conversation" && conversation.title !== null)) return;

    try {
      const title = await this.generationService.generateTitle(content);
      await this.repo.updateConversationTitle(conversationId, title);
      this.logger.log(`Auto-title generated: conversationId=${conversationId}, title="${title}"`);
    } catch (error) {
      this.logger.warn(
        `Auto-title generation failed: conversationId=${conversationId}, error=${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
