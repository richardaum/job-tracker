import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@WithGeneratedId()
@Entity({ name: "application_stage_events" })
export class ApplicationStageEventEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "application_id", type: "text" })
  applicationId!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({
    name: "from_stage",
    type: "enum",
    enum: [
      "new",
      "applied",
      "recruiter_screen",
      "technical",
      "cultural_fit",
      "offer",
      "rejected",
      "duplicated",
    ],
    enumName: "application_stage",
    nullable: true,
  })
  fromStage!:
    | "new"
    | "applied"
    | "recruiter_screen"
    | "technical"
    | "cultural_fit"
    | "offer"
    | "rejected"
    | "duplicated"
    | null;

  @Column({
    name: "to_stage",
    type: "enum",
    enum: [
      "new",
      "applied",
      "recruiter_screen",
      "technical",
      "cultural_fit",
      "offer",
      "rejected",
      "duplicated",
    ],
    enumName: "application_stage",
  })
  toStage!:
    | "new"
    | "applied"
    | "recruiter_screen"
    | "technical"
    | "cultural_fit"
    | "offer"
    | "rejected"
    | "duplicated";

  @Column({ type: "text", default: "manual" })
  source!: string;

  @Column({ type: "text", nullable: true })
  reason!: string | null;

  @Column({ name: "schedule_at", type: "timestamptz", nullable: true })
  scheduledAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
