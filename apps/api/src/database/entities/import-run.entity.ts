import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { ImportTemplateEntity } from "./import-template.entity";

@WithGeneratedId()
@Entity({ name: "import_runs" })
export class ImportRunEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "template_id", type: "text" })
  templateId!: string;

  @ManyToOne(() => ImportTemplateEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "template_id" })
  template!: ImportTemplateEntity;

  @Column({ name: "surface_url", type: "text", nullable: false })
  surfaceUrl!: string;

  @Column({
    type: "enum",
    enum: ImportRunStatusEnum,
    enumName: "import_run_status",
    default: ImportRunStatusEnum.RUNNING,
  })
  status!: ImportRunStatusEnum;

  @Column({ name: "started_at", type: "timestamptz" })
  startedAt!: Date;
}
