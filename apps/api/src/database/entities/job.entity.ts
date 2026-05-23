import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { ApplicationSourceEnum } from "@api/domains/jobs/job-source.enum";
import { ApplicationStageEnum } from "@api/domains/jobs/job-stage.enum";
import { JOB_TITLE_MAX_LENGTH } from "@api/domains/jobs/job-title.constraints";
import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";
import { MaxLength, ValidateIf } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { CompanyEntity } from "./company.entity";
import { SourceRunEntity } from "./source-run.entity";

@Entity({ name: "jobs" })
export class JobEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text", nullable: true })
  @ValidateIf((_e: JobEntity, v: unknown) => typeof v === "string")
  @MaxLength(JOB_TITLE_MAX_LENGTH)
  title!: string | null;

  @Column({ name: "company_id", type: "text", nullable: true })
  companyId!: string | null;

  @ManyToOne(() => CompanyEntity, (company) => company.jobs, { nullable: true })
  @JoinColumn({ name: "company_id" })
  company?: CompanyEntity | null;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({
    name: "urls",
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  urls!: string[];

  @Column({
    type: "enum",
    enum: ApplicationSourceEnum,
    enumName: "application_source",
    nullable: true,
  })
  source!: ApplicationSourceEnum | null;

  @Column({ name: "salary_min_cents", type: "integer", nullable: true })
  salaryMinCents!: number | null;

  @Column({ name: "salary_max_cents", type: "integer", nullable: true })
  salaryMaxCents!: number | null;

  @Column({ name: "salary_currency", type: "text", nullable: true })
  salaryCurrency!: string | null;

  @Column({
    name: "salary_period",
    type: "enum",
    enum: SalaryPeriodEnum,
    enumName: "salary_period",
    nullable: true,
  })
  salaryPeriod!: SalaryPeriodEnum | null;

  @Column({
    name: "tags",
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  tags!: string[];

  @Column({ type: "text", nullable: true })
  location!: string | null;

  @Column({ name: "work_region", type: "text", nullable: true })
  workRegion!: string | null;

  @Column({ name: "html_content", type: "text", nullable: true })
  htmlContent!: string | null;

  @Column(() => AsyncMetadataEmbedded, { prefix: "fill" })
  fillMetadata?: AsyncMetadataEmbedded | null;

  @Column({
    type: "enum",
    enum: ApplicationStageEnum,
    enumName: "application_stage",
    default: ApplicationStageEnum.NEW,
  })
  stage!: ApplicationStageEnum;

  @Column({ type: "text", nullable: true })
  summary!: string | null;

  @Column(() => AsyncMetadataEmbedded, { prefix: "summary" })
  summaryMetadata?: AsyncMetadataEmbedded | null;

  @Column({ name: "source_run_id", type: "text", nullable: true })
  sourceRunId!: string | null;

  @ManyToOne(() => SourceRunEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "source_run_id" })
  sourceRun?: SourceRunEntity | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
