import { AiMessageRoleEnum } from "./ai-message-role.enum";
import { AiMessageStreamEventType } from "./ai-chat-event.types";
import { AiMessageStreamPhaseEnum } from "./ai-message-stream-phase.enum";
import { AiChatPubSub } from "./ai-chat.pubsub";
import { AiChatSubEventEnum } from "./ai-chat-sub-event.enum";
import { JobsRepository } from "@api/domains/jobs/jobs.repository";
import { AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { DeleteMutationPayloadType } from "@api/domains/shared/delete-mutation-payload.type";
import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
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
    private readonly pubSub: AiChatPubSub,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.resetStaleProcessing();
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

    const userMessage = await this.repo.createMessage({ conversationId, role: AiMessageRoleEnum.User, content });

    await this.repo.updateGeneratingStatus(conversationId, {
      status: AsyncMetadataStatusEnum.Processing,
      timestamp: new Date(),
    });

    await this.pubSub.publish(AiChatSubEventEnum.AiChatRequested, {
      conversationId,
      userId,
      jobId: conversation.jobId,
      content,
      userMessageId: userMessage.id,
    });

    return { success: true };
  }

  async *subscribeStream(conversationId: string, userId: string): AsyncIterable<AiMessageStreamEventType> {
    const conversation = await this.repo.findConversationById(conversationId, userId);
    if (!conversation) throw new NotFoundException(`AiConversation ${conversationId} not found`);

    yield { conversationId, phase: AiMessageStreamPhaseEnum.Ready };

    const iterator = this.pubSub.asyncIterableIterator(AiChatSubEventEnum.AiMessageStreamed);
    for await (const event of iterator) {
      if (event.conversationId === conversationId) {
        yield event;
      }
    }
  }
}
