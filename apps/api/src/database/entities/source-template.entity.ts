import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from "typeorm";

import { PlanEntity } from "./plan.entity";

@Entity({ name: "source_templates" })
@Unique(["userId", "planId"])
export class SourceTemplateEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "plan_id", type: "uuid" })
  planId!: string;

  @ManyToOne(() => PlanEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "plan_id" })
  plan!: PlanEntity;

  @Column({ name: "schedule_cron", type: "text", nullable: true })
  scheduleCron!: string | null;

  @Column({ name: "schedule_enabled", type: "boolean", default: false })
  scheduleEnabled!: boolean;

  @Column({ name: "surface_url", type: "text", nullable: false })
  surfaceUrl!: string;

  @Column({ type: "jsonb", nullable: true })
  config!: Record<string, unknown> | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
