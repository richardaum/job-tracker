import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export enum RequirementType {
  MUST_HAVE = "must_have",
  NICE_TO_HAVE = "nice_to_have",
  SOFT_SKILL = "soft_skill",
}

export interface FitItem {
  requirement: string;
  source: "resume" | "preference";
  weight?: "high" | "low";
  type: RequirementType;
  verdict: "fit" | "gap" | "unclear";
  jdQuote: string;
  sourceQuotes: string[];
  suggestion?: string;
}

export type FitClassification = "positive" | "neutral" | "negative";

export enum FitAnalysisStatus {
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

@WithGeneratedId()
@Entity({ name: "fit_analysis" })
export class FitAnalysisEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "application_id", type: "text", unique: true })
  applicationId!: string;

  @Column({ name: "resume_id", type: "text" })
  resumeId!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: FitAnalysisStatus,
    enumName: "fit_analysis_status",
    default: FitAnalysisStatus.COMPLETED,
  })
  status!: FitAnalysisStatus;

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
