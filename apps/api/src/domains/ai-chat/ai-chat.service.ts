import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";

import { AiChatEventBus } from "./ai-chat-event.bus";
import { AiChatGenerationService } from "./ai-chat-generation.service";
import { AiChatRepository } from "./ai-chat.repository";
import { AiConversationType } from "./ai-conversation.type";
import { AiMessageType } from "./ai-message.type";
import { AiMessageCompleted } from "./ai-chat.events";
import { AskQuestionPayloadType } from "./ask-question-payload.type";

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private readonly repo: AiChatRepository,
    private readonly jobsRepo: JobsRepository,
    private readonly generationService: AiChatGenerationService,
    private readonly eventBus: AiChatEventBus,
  ) {}

  async createConversation(jobId: string, userId: string): Promise<AiConversationType> {
    const job = await this.jobsRepo.findOneByIdAndUserId(jobId, userId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    return this.repo.createConversation({ jobId, userId });
  }

  async listConversations(jobId: string, userId: string): Promise<AiConversationType[]> {
    const job = await this.jobsRepo.findOneByIdAndUserId(jobId, userId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    return this.repo.findConversationsByJobId(jobId, userId);
  }

  async deleteConversation(id: string, userId: string): Promise<DeleteMutationPayloadType> {
    const deleted = await this.repo.deleteConversation(id, userId);
    if (!deleted) {
      throw new NotFoundException(`AiConversation ${id} not found`);
    }

    return { success: true, deletedId: id };
  }

  async listMessages(conversationId: string, userId: string): Promise<AiMessageType[]> {
    const conversation = await this.repo.findConversationById(conversationId, userId);
    if (!conversation) {
      throw new NotFoundException(`AiConversation ${conversationId} not found`);
    }

    return this.repo.findMessagesByConversationId(conversationId);
  }

  async askQuestion(
    conversationId: string,
    userId: string,
    content: string,
  ): Promise<AskQuestionPayloadType> {
    const conversation = await this.repo.findConversationById(conversationId, userId);
    if (!conversation) {
      throw new NotFoundException(`AiConversation ${conversationId} not found`);
    }

    this.startBackgroundStream(conversationId, userId, conversation.jobId, content);

    return { success: true };
  }

  private async generateTitleIfFirstMessage(
    conversationId: string,
    userId: string,
    content: string,
  ): Promise<void> {
    const conversation = await this.repo.findConversationById(conversationId, userId);
    if (!conversation || conversation.title !== "New conversation") return;

    try {
      const title = await this.generationService.generateTitle(content);
      await this.repo.updateConversationTitle(conversationId, title);
      this.logger.log(`Auto-title generated: conversationId=${conversationId}, title="${title}"`);
    } catch (error) {
      this.logger.warn(
        `Auto-title generation failed: conversationId=${conversationId}, error=${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private startBackgroundStream(
    conversationId: string,
    userId: string,
    jobId: string,
    content: string,
  ): void {
    this.generationService
      .generateAnswer(conversationId, userId, jobId, content)
      .then(async (fullContent) => {
        if (!fullContent) {
          this.eventBus.emit(new AiMessageCompleted(conversationId, userId, "", ""));
          return;
        }

        const userMessageId = crypto.randomUUID();
        const aiMessageId = crypto.randomUUID();

        await this.repo.createMessagesBatch([
          { id: userMessageId, conversationId, role: "user", content },
          { id: aiMessageId, conversationId, role: "assistant", content: fullContent },
        ]);

        this.logger.log(
          `Messages persisted: conversationId=${conversationId}, userMessageId=${userMessageId}, aiMessageId=${aiMessageId}`,
        );

        await this.generateTitleIfFirstMessage(conversationId, userId, content);

        this.eventBus.emit(new AiMessageCompleted(conversationId, userId, userMessageId, aiMessageId));
      })
      .catch((error) => {
        this.logger.error(
          `AI stream failed: conversationId=${conversationId}, error=${error instanceof Error ? error.message : String(error)}`,
        );

        this.eventBus.emit(new AiMessageCompleted(conversationId, userId, "", ""));
      });
  }
}
