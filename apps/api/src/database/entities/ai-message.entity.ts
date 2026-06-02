import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "ai_messages" })
export class AiMessageEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "conversation_id", type: "text" })
  conversationId!: string;

  @Column({ type: "text" })
  role!: string;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
