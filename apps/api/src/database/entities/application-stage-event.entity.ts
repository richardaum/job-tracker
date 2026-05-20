import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import { ApplicationStageEnum } from "@api/domains/applications/application-stage.enum";
import { StageEventSourceEnum } from "@api/domains/applications/stage-event-source.enum";
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
    enum: ApplicationStageEnum,
    enumName: "application_stage",
    nullable: true,
  })
  fromStage!: ApplicationStageEnum | null;

  @Column({
    name: "to_stage",
    type: "enum",
    enum: ApplicationStageEnum,
    enumName: "application_stage",
  })
  toStage!: ApplicationStageEnum;

  @Column({
    type: "enum",
    enum: StageEventSourceEnum,
    enumName: "stage_event_source",
    default: StageEventSourceEnum.MANUAL,
  })
  source!: StageEventSourceEnum;

  @Column({ type: "text", nullable: true })
  reason!: string | null;

  @Column({ name: "schedule_at", type: "timestamptz", nullable: true })
  scheduledAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
