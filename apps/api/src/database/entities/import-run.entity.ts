import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { Column, Entity, PrimaryColumn } from "typeorm";

@WithGeneratedId()
@Entity({ name: "import_runs" })
export class ImportRunEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "importer_id", type: "text" })
  importerId!: string;

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
