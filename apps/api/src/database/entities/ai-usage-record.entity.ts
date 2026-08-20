import { AiUsageSourceEnum } from "@api/domains/ai-usage/ai-usage-source.enum";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { UserEntity } from "./user.entity";

@Entity({ name: "ai_usage_records" })
@Index("idx_ai_usage_records_user_source_created_at", ["userId", "source", "createdAt"])
export class AiUsageRecordEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ type: "enum", enum: AiUsageSourceEnum, enumName: "ai_usage_source" })
  source!: AiUsageSourceEnum;

  @Column({ name: "input_tokens", type: "integer" })
  inputTokens!: number;

  @Column({ name: "output_tokens", type: "integer" })
  outputTokens!: number;

  @Column({ name: "total_tokens", type: "integer" })
  totalTokens!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
