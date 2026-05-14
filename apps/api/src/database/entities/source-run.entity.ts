import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { SourceRunStatusEnum } from "@api/domains/sources/source-run-status.enum";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { SourceTemplateEntity } from "./source-template.entity";

@WithGeneratedId()
@Entity({ name: "source_runs" })
export class SourceRunEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "template_id", type: "text" })
  templateId!: string;

  @ManyToOne(() => SourceTemplateEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "template_id" })
  template!: SourceTemplateEntity;

  @Column({ name: "surface_url", type: "text", nullable: false })
  surfaceUrl!: string;

  @Column({
    type: "enum",
    enum: SourceRunStatusEnum,
    enumName: "source_run_status",
    default: SourceRunStatusEnum.RUNNING,
  })
  status!: SourceRunStatusEnum;

  @Column({ name: "started_at", type: "timestamptz" })
  startedAt!: Date;
}
