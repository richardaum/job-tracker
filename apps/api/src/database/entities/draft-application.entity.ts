import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

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

  @Column({ type: "text" })
  url!: string;

  @Column({ type: "text" })
  title!: string;

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

  @OneToMany(
    () => ApplicationEntity,
    (application) => application.draftApplication,
  )
  applications!: ApplicationEntity[];
}
