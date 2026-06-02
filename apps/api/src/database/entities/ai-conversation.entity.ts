import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "ai_conversations" })
export class AiConversationEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "job_id", type: "text" })
  jobId!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text", default: "New conversation" })
  title!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
