import { AiConversationEntity } from "@api/database/entities/ai-conversation.entity";
import { AiMessageEntity } from "@api/database/entities/ai-message.entity";
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

  async updateConversationTitle(id: string, title: string): Promise<void> {
    await this.convRepo.update({ id }, { title });
  }

  async createMessagesBatch(messages: Partial<AiMessageEntity>[]): Promise<AiMessageEntity[]> {
    const rows = this.msgRepo.create(messages);
    return this.msgRepo.save(rows);
  }
}
