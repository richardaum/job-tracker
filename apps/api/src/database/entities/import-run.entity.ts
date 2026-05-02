import { randomUUID } from "node:crypto";

import { ImportRunStatusEnum } from "@api/domains/imports/import-run-status.enum";
import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "import_runs" })
export class ImportRunEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @BeforeInsert()
  setId(): void {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "importer_id", type: "text" })
  importerId!: string;

  @Column({ name: "importer_name", type: "text" })
  importerName!: string;

  @Column({ name: "entry_url", type: "text" })
  entryUrl!: string;

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
