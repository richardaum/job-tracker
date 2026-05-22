import { ConversionMetadataEmbedded } from "@api/database/embeddeds/conversion-metadata.embedded";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

export enum DraftJobConversionStatusEnum {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
}

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

  @Column(() => ConversionMetadataEmbedded, { prefix: "conversion" })
  conversionMetadata?: ConversionMetadataEmbedded | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
