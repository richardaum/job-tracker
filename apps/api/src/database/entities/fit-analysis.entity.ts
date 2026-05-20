import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { FitClassificationEnum } from "@api/domains/fit-analysis/fit-classification.enum";
import { FitSourceEnum } from "@api/domains/fit-analysis/fit-source.enum";
import { FitVerdictEnum } from "@api/domains/fit-analysis/fit-verdict.enum";
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

import { DraftApplicationEntity } from "./draft-application.entity";

export enum RequirementTypeEnum {
  MustHave = "MustHave",
  NiceToHave = "NiceToHave",
  SoftSkill = "SoftSkill",
}

export interface FitItem {
  requirement: string;
  source: FitSourceEnum;
  weight?: "high" | "low";
  type: RequirementTypeEnum;
  verdict: FitVerdictEnum;
  jdQuote: string;
  sourceQuotes: string[];
  suggestion?: string;
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

  @Column({ name: "generation_metadata", type: "jsonb", nullable: true })
  generationMetadata!: AsyncMetadata | null;

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
