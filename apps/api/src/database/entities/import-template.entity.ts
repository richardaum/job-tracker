import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Unique,
} from "typeorm";

@WithGeneratedId()
@Entity({ name: "import_templates" })
@Unique(["userId", "importerId"])
export class ImportTemplateEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "importer_id", type: "text" })
  importerId!: string;

  @Column({ name: "schedule_cron", type: "text", nullable: true })
  scheduleCron!: string | null;

  @Column({ name: "schedule_enabled", type: "boolean", default: false })
  scheduleEnabled!: boolean;

  @Column({ name: "surface_url", type: "text", nullable: false })
  surfaceUrl!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
