import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { DraftApplicationEntity } from "./draft-application.entity";

export enum RequirementTypeEnum {
  MUST_HAVE = "MUST_HAVE",
  NICE_TO_HAVE = "NICE_TO_HAVE",
  SOFT_SKILL = "SOFT_SKILL",
}

export interface FitItem {
  requirement: string;
  source: "resume" | "preference";
  weight?: "high" | "low";
  type: RequirementTypeEnum;
  verdict: "fit" | "gap" | "unclear";
  jdQuote: string;
  sourceQuotes: string[];
  suggestion?: string;
}

export type FitClassification = "positive" | "neutral" | "negative";

export enum FitAnalysisStatusEnum {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

@WithGeneratedId()
@Entity({ name: "fit_analysis" })
export class FitAnalysisEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "application_id", type: "text", nullable: true })
  applicationId!: string | null;

  @Column({ name: "draft_application_id", type: "text", nullable: true })
  draftApplicationId!: string | null;

  @Column({ name: "user_id", type: "text", nullable: true })
  userId!: string | null;

  @ManyToOne(() => DraftApplicationEntity, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "draft_application_id" })
  draftApplication?: DraftApplicationEntity | null;

  @Column({ name: "resume_id", type: "text" })
  resumeId!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: FitAnalysisStatusEnum,
    enumName: "fit_analysis_status",
    default: FitAnalysisStatusEnum.COMPLETED,
  })
  status!: FitAnalysisStatusEnum;

  @Column({ name: "error", type: "text", nullable: true })
  error!: string | null;

  @Column({ name: "score_ratio", type: "float", nullable: true })
  scoreRatio!: number | null;

  @Column({ type: "text", nullable: true })
  classification!: FitClassification | null;

  @Column({ name: "fit_count", type: "integer", default: 0 })
  fitCount!: number;

  @Column({ name: "gap_count", type: "integer", default: 0 })
  gapCount!: number;

  @Column({ name: "unclear_count", type: "integer", default: 0 })
  unclearCount!: number;

  @Column({ type: "jsonb", default: [] })
  items!: FitItem[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
