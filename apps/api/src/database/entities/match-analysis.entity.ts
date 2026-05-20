import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import type { AsyncMetadata } from "@api/domains/shared/async-metadata.type";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { DraftJobEntity } from "./draft-job.entity";

export enum RequirementTypeEnum {
  MUST_HAVE = "MUST_HAVE",
  NICE_TO_HAVE = "NICE_TO_HAVE",
  SOFT_SKILL = "SOFT_SKILL",
}

export interface MatchItem {
  requirement: string;
  source: "resume" | "preference";
  weight?: "high" | "low";
  type: RequirementTypeEnum;
  verdict: "fit" | "gap" | "unclear";
  jdQuote: string;
  sourceQuotes: string[];
  suggestion?: string;
}

export type MatchClassification = "positive" | "neutral" | "negative";

@WithGeneratedId()
@Entity({ name: "match_analysis" })
export class MatchAnalysisEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "job_id", type: "text", nullable: true })
  jobId!: string | null;

  @Column({ name: "draft_job_id", type: "text", nullable: true })
  draftJobId!: string | null;

  @Column({ name: "user_id", type: "text", nullable: true })
  userId!: string | null;

  @ManyToOne(() => DraftJobEntity, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "draft_job_id" })
  draftJob?: DraftJobEntity | null;

  @Column({ name: "resume_id", type: "text" })
  resumeId!: string;

  @Column({ name: "generation_metadata", type: "jsonb", nullable: true })
  generationMetadata!: AsyncMetadata | null;

  @Column({ name: "score_ratio", type: "float", nullable: true })
  scoreRatio!: number | null;

  @Column({ type: "text", nullable: true })
  classification!: MatchClassification | null;

  @Column({ name: "fit_count", type: "integer", default: 0 })
  matchCount!: number;

  @Column({ name: "gap_count", type: "integer", default: 0 })
  gapCount!: number;

  @Column({ name: "unclear_count", type: "integer", default: 0 })
  unclearCount!: number;

  @Column({ type: "jsonb", default: [] })
  items!: MatchItem[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
