import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { FitClassificationEnum } from "@api/domains/match-analysis/fit-classification.enum";
import { FitSourceEnum } from "@api/domains/match-analysis/fit-source.enum";
import { FitVerdictEnum } from "@api/domains/match-analysis/fit-verdict.enum";
import { IsNotEmpty, IsString } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export enum RequirementTypeEnum {
  MustHave = "MustHave",
  NiceToHave = "NiceToHave",
  SoftSkill = "SoftSkill",
}

export interface MatchItem {
  requirement: string;
  source: FitSourceEnum;
  weight?: "high" | "low";
  type: RequirementTypeEnum;
  verdict: FitVerdictEnum;
  jdQuote: string;
  sourceQuotes: string[];
  suggestion?: string;
}

export type MatchClassification = "positive" | "neutral" | "negative";

@Entity({ name: "match_analysis" })
export class MatchAnalysisEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "job_id", type: "text" })
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @Column({ name: "user_id", type: "text", nullable: true })
  userId!: string | null;

  @Column({ name: "resume_id", type: "text" })
  resumeId!: string;

  @Column(() => AsyncMetadataEmbedded, { prefix: "generation" })
  generationMetadata?: AsyncMetadataEmbedded | null;

  @Column({ name: "score_ratio", type: "float", nullable: true })
  scoreRatio!: number | null;

  @Column({
    type: "enum",
    enum: FitClassificationEnum,
    enumName: "fit_classification",
    nullable: true,
  })
  classification!: FitClassificationEnum | null;

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
