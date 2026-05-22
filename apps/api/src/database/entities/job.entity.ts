import { AsyncMetadataEmbedded } from "@api/database/embeddeds/async-metadata.embedded";
import { SalaryEmbedded } from "@api/database/embeddeds/salary.embedded";
import { ApplicationSourceEnum } from "@api/domains/jobs/job-source.enum";
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

  @Column(() => SalaryEmbedded, { prefix: "salary" })
  salary?: SalaryEmbedded | null;

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

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
