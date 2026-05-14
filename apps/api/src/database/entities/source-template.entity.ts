import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  Unique,
} from "typeorm";

@WithGeneratedId()
@Entity({ name: "source_templates" })
@Unique(["userId", "sourceProfileId"])
export class SourceTemplateEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "source_profile_id", type: "text" })
  sourceProfileId!: string;

  @Column({ name: "schedule_cron", type: "text", nullable: true })
  scheduleCron!: string | null;

  @Column({ name: "schedule_enabled", type: "boolean", default: false })
  scheduleEnabled!: boolean;

  @Column({ name: "surface_url", type: "text", nullable: false })
  surfaceUrl!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
