import { UserEntity } from "@api/database/entities/user.entity";
import type { BlockedKeyword } from "@api/domains/settings/keyword-blocker.types";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

import { EncryptedColumnTransformer } from "@api/lib/crypto/encrypted-column.transformer";

@Entity({ name: "user_settings" })
export class UserSettingEntity {
  @PrimaryColumn({ name: "user_id", type: "text" })
  userId!: string;

  @OneToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ name: "auto_fill_enabled", type: "boolean", default: false })
  autoFillEnabled!: boolean;

  @Column({ name: "auto_summary_enabled", type: "boolean", default: false })
  autoSummaryEnabled!: boolean;

  @Column({ name: "auto_match_enabled", type: "boolean", default: false })
  autoMatchEnabled!: boolean;

  @Column({ name: "duplicate_window_days", type: "int", default: 30 })
  duplicateWindowDays!: number;

  @Column({ name: "blocked_keywords", type: "jsonb", default: [] })
  blockedKeywords!: BlockedKeyword[];

  @Column({ name: "blocked_companies", type: "jsonb", default: [] })
  blockedCompanies!: string[];

  @Column({ name: "ai_enabled", type: "boolean", default: true })
  aiEnabled!: boolean;

  @Column({
    name: "openai_api_key_encrypted",
    type: "text",
    nullable: true,
    transformer: new EncryptedColumnTransformer(),
  })
  openaiApiKeyEncrypted!: string | null;

  @Column({ name: "trial_calls_used", type: "int", default: 0 })
  trialCallsUsed!: number;

  @Column({ name: "trial_calls_limit", type: "int", default: 50 })
  trialCallsLimit!: number;

  @Column({ name: "last_quick_tip_id", type: "text", nullable: true })
  lastQuickTipId!: string | null;

  @Column({ name: "dismissed_quick_tip_ids", type: "text", array: true, default: () => "ARRAY[]::text[]" })
  dismissedQuickTipIds!: string[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
