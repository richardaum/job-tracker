import { randomUUID } from "node:crypto";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from "typeorm";

@Entity({ name: "application_stage_events" })
export class ApplicationStageEventEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @BeforeInsert()
  setId(): void {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

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
      "offer",
      "rejected",
    ],
    enumName: "application_stage",
    nullable: true,
  })
  fromStage!:
    | "new"
    | "applied"
    | "recruiter_screen"
    | "technical"
    | "offer"
    | "rejected"
    | null;

  @Column({
    name: "to_stage",
    type: "enum",
    enum: [
      "new",
      "applied",
      "recruiter_screen",
      "technical",
      "offer",
      "rejected",
    ],
    enumName: "application_stage",
  })
  toStage!:
    | "new"
    | "applied"
    | "recruiter_screen"
    | "technical"
    | "offer"
    | "rejected";

  @Column({ type: "text", default: "manual" })
  source!: string;

  @Column({ type: "text", nullable: true })
  reason!: string | null;

  @Column({ name: "schedule_at", type: "timestamp", nullable: true })
  scheduledAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;
}
