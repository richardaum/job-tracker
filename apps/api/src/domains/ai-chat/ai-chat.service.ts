import { AiMessageRoleEnum } from "./ai-message-role.enum";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";

import { AiChatEventBus } from "./ai-chat-event.bus";
import { AiChatRequested } from "./ai-chat.events";
import { AiChatRepository } from "./ai-chat.repository";
import { AiConversationType } from "./ai-conversation.type";
import { AiMessageType } from "./ai-message.type";
import { AskQuestionPayloadType } from "./ask-question-payload.type";

@Injectable()
export class AiChatService implements OnModuleInit {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    private readonly repo: AiChatRepository,
    private readonly jobsRepo: JobsRepository,
    private readonly eventBus: AiChatEventBus,
  ) {}

  onModuleInit(): void {
    void this.resetStaleProcessing();
  }

  private async resetStaleProcessing(): Promise<void> {
    const count = await this.repo.resetStaleGeneratingStatus();
    if (count > 0) {
      this.logger.warn(`Recovered ${count} stale AI chat generating states`);
    }
  }

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

  async askQuestion(conversationId: string, userId: string, content: string): Promise<AskQuestionPayloadType> {
    const conversation = await this.repo.findConversationById(conversationId, userId);
    if (!conversation) {
      throw new NotFoundException(`AiConversation ${conversationId} not found`);
    }

    // Persist user message immediately
    const userMessageId = crypto.randomUUID();
    await this.repo.createMessage({ id: userMessageId, conversationId, role: AiMessageRoleEnum.User, content });

    // Update generating status to Processing
    await this.repo.updateGeneratingStatus(conversationId, {
      status: AsyncMetadataStatusEnum.Processing,
      timestamp: new Date(),
    });

    // Request background processing
    this.eventBus.emit(new AiChatRequested(conversationId, userId, conversation.jobId, content, userMessageId));

    return { success: true };
  }
}
