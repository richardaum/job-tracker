import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { ApplicationSourceEnum } from "@api/domains/jobs/job-source.enum";
import { SalaryPeriodEnum } from "@api/domains/jobs/salary/salary-period.enum";
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
import { DraftJobEntity } from "./draft-job.entity";
import { SourceRunEntity } from "./source-run.entity";

@Entity({ name: "jobs" })
export class JobEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text" })
  title!: string;

  @Column({ name: "company_id", type: "text" })
  companyId!: string;

  @ManyToOne(() => CompanyEntity, (company) => company.jobs)
  @JoinColumn({ name: "company_id" })
  company!: CompanyEntity;

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

  @ManyToOne(() => DraftJobEntity, (draft) => draft.jobs, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "draft_job_id" })
  draftJob?: DraftJobEntity | null;

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
