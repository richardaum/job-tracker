import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AiMessageRoleEnum } from "@api/domains/ai-chat/ai-message-role.enum";

@Entity({ name: "ai_messages" })
export class AiMessageEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "conversation_id", type: "uuid" })
  conversationId!: string;

  @Column({ type: "enum", enum: AiMessageRoleEnum, enumName: "ai_message_role" })
  role!: AiMessageRoleEnum;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
