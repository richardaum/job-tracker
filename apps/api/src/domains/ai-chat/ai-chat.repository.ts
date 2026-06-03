import { AiConversationEntity } from "@api/database/entities/ai-conversation.entity";
import { AiMessageEntity } from "@api/database/entities/ai-message.entity";
import { AsyncMetadata, AsyncMetadataStatusEnum } from "@api/domains/shared/async-metadata.type";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AiChatRepository {
  constructor(
    @InjectRepository(AiConversationEntity)
    private readonly convRepo: Repository<AiConversationEntity>,
    @InjectRepository(AiMessageEntity)
    private readonly msgRepo: Repository<AiMessageEntity>,
  ) {}

  async findConversationsByJobId(jobId: string, userId: string): Promise<AiConversationEntity[]> {
    return this.convRepo.find({ where: { jobId, userId }, order: { updatedAt: "DESC" } });
  }

  async findConversationById(id: string, userId: string): Promise<AiConversationEntity | null> {
    return this.convRepo.findOne({ where: { id, userId } });
  }

  async createConversation(data: Partial<AiConversationEntity>): Promise<AiConversationEntity> {
    const row = this.convRepo.create(data);
    return this.convRepo.save(row);
  }

  async deleteConversation(id: string, userId: string): Promise<AiConversationEntity | null> {
    const existing = await this.findConversationById(id, userId);
    if (!existing) {
      return null;
    }

    await this.msgRepo.delete({ conversationId: id });
    await this.convRepo.delete({ id, userId });
    return existing;
  }

  async findMessagesByConversationId(conversationId: string): Promise<AiMessageEntity[]> {
    return this.msgRepo.find({ where: { conversationId }, order: { createdAt: "ASC" } });
  }

  async createMessage(data: Partial<AiMessageEntity>): Promise<AiMessageEntity> {
    const row = this.msgRepo.create(data);
    return this.msgRepo.save(row);
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    await this.convRepo.update({ id }, { title });
  }

  async updateGeneratingStatus(id: string, status: AsyncMetadata): Promise<void> {
    await this.convRepo.update({ id }, { generatingStatus: status });
  }

  async resetStaleGeneratingStatus(): Promise<number> {
    const staleThreshold = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes
    const result = await this.convRepo
      .createQueryBuilder()
      .update(AiConversationEntity)
      .set({
        generatingStatus: {
          status: AsyncMetadataStatusEnum.Failed,
          error: "Stale generation process timed out.",
          timestamp: new Date(),
        },
      })
      .where("generating_status->>'status' = :status", { status: AsyncMetadataStatusEnum.Processing })
      .andWhere("updated_at < :threshold", { threshold: staleThreshold })
      .execute();

    return result.affected || 0;
  }

  async createMessagesBatch(messages: Partial<AiMessageEntity>[]): Promise<AiMessageEntity[]> {
    const rows = this.msgRepo.create(messages);
    return this.msgRepo.save(rows);
  }
}
