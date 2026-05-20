import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import type { AsyncMetadata } from "@api/domains/shared/async-metadata.type";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { JobEntity } from "./job.entity";

export enum DraftJobConversionStatusEnum {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
}

export type ConversionMetadata = Omit<AsyncMetadata, "status"> & {
  status: DraftJobConversionStatusEnum;
};

@WithGeneratedId()
@Entity({ name: "draft_jobs" })
export class DraftJobEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ type: "text", nullable: true })
  url!: string | null;

  @Column({ type: "text" })
  title!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "html_content", type: "text" })
  htmlContent!: string;

  @Column({ name: "conversion_metadata", type: "jsonb", nullable: true })
  conversionMetadata!: ConversionMetadata | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => JobEntity, (job) => job.draftJob)
  jobs!: JobEntity[];
}
