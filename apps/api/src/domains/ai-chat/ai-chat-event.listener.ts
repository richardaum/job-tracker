import { AiMessageRoleEnum } from "./ai-message-role.enum";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AiChatEventBus } from "./ai-chat-event.bus";
import { AiChatGenerationService } from "./ai-chat-generation.service";
import { AiChatRepository } from "./ai-chat.repository";
import { AiChatRequested, AiMessageCompleted, AiMessageError } from "./ai-chat.events";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";

@Injectable()
export class AiChatEventListener implements OnModuleInit {
  private readonly logger = new Logger(AiChatEventListener.name);

  constructor(
    private readonly eventBus: AiChatEventBus,
    private readonly generationService: AiChatGenerationService,
    private readonly repo: AiChatRepository,
  ) {}

  onModuleInit(): void {
    this.eventBus.on(AiChatRequested, (event) => {
      void this.handleChatRequested(event);
    });

    this.logger.log("Listening for ai.chat.requested events");
  }

  private async handleChatRequested(event: AiChatRequested): Promise<void> {
    const { conversationId, userId, jobId, content, userMessageId } = event;

    try {
      const fullContent = await this.generationService.generateAnswer(conversationId, userId, jobId, content);

      if (!fullContent) {
        throw new Error("AI returned no content");
      }

      const aiMessageId = crypto.randomUUID();
      await this.repo.createMessage({
        id: aiMessageId,
        conversationId,
        role: AiMessageRoleEnum.Assistant,
        content: fullContent,
      });

      // Update generating status to Completed
      await this.repo.updateGeneratingStatus(conversationId, {
        status: AsyncMetadataStatusEnum.Completed,
        timestamp: new Date(),
      });

      this.logger.log(`AI message persisted: conversationId=${conversationId}, aiMessageId=${aiMessageId}`);

      await this.generateTitleIfFirstMessage(conversationId, userId, content);

      this.eventBus.emit(new AiMessageCompleted(conversationId, userId, userMessageId, aiMessageId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`AI generation failed: conversationId=${conversationId}, error=${errorMessage}`);

      // Update generating status to Failed
      await this.repo.updateGeneratingStatus(conversationId, {
        status: AsyncMetadataStatusEnum.Failed,
        error: errorMessage,
        timestamp: new Date(),
      });

      this.eventBus.emit(new AiMessageError(conversationId, userId, errorMessage));
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
