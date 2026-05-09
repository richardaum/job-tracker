import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { ApplicationSource } from "@api/domains/applications/application-source.enum";
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
import { DraftApplicationEntity } from "./draft-application.entity";
import { ImportRunEntity } from "./import-run.entity";

@WithGeneratedId()
@Entity({ name: "applications" })
export class ApplicationEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text" })
  title!: string;

  @Column({ name: "company_id", type: "text" })
  companyId!: string;

  @ManyToOne(() => CompanyEntity, (company) => company.applications)
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
    enum: ApplicationSource,
    enumName: "application_source",
    nullable: true,
  })
  source!: ApplicationSource | null;

  @Column({ name: "salary_min_cents", type: "integer", nullable: true })
  salaryMinCents!: number | null;

  @Column({ name: "salary_max_cents", type: "integer", nullable: true })
  salaryMaxCents!: number | null;

  @Column({ name: "salary_currency", type: "text", nullable: true })
  salaryCurrency!: string | null;

  @Column({
    name: "salary_period",
    type: "enum",
    enum: ["year", "month", "hour"],
    enumName: "salary_period",
    nullable: true,
  })
  salaryPeriod!: "year" | "month" | "hour" | null;

  @Column({
    name: "tags",
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  tags!: string[];

  @ManyToOne(() => DraftApplicationEntity, (draft) => draft.applications, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "draft_application_id" })
  draftApplication?: DraftApplicationEntity | null;

  @Column({ name: "import_run_id", type: "text", nullable: true })
  importRunId!: string | null;

  @ManyToOne(() => ImportRunEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "import_run_id" })
  importRun?: ImportRunEntity | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
