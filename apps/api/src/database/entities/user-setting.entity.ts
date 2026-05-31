import { UserEntity } from "@api/database/entities/user.entity";
import type { BlockedKeyword } from "@api/domains/settings/keyword-blocker.types";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

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

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
