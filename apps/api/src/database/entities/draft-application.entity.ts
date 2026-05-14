import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { ApplicationEntity } from "./application.entity";

export enum DraftApplicationConversionStatus {
  IDLE = "idle",
  PROCESSING = "processing",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

@WithGeneratedId()
@Entity({ name: "draft_applications" })
export class DraftApplicationEntity {
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

  @Column({
    name: "conversion_status",
    type: "enum",
    enum: DraftApplicationConversionStatus,
    enumName: "draft_application_conversion_status",
    default: DraftApplicationConversionStatus.IDLE,
  })
  conversionStatus!: DraftApplicationConversionStatus;

  @Column({ name: "conversion_error", type: "text", nullable: true })
  conversionError!: string | null;

  @Column({ name: "converted_at", type: "timestamptz", nullable: true })
  convertedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(
    () => ApplicationEntity,
    (application) => application.draftApplication,
  )
  applications!: ApplicationEntity[];
}
