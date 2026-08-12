import { UserEntity } from "@api/database/entities/user.entity";
import { TourProgressStatusEnum } from "@api/domains/welcome-tour/tour-progress-status.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "user_tour_progress" })
@Unique("uq_user_tour_progress_user_tour", ["userId", "tourId"])
export class UserTourProgressEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ name: "tour_id", type: "text" })
  tourId!: string;

  @Column({ name: "tour_version", type: "integer", default: 1 })
  tourVersion!: number;

  @Column({
    type: "enum",
    enum: TourProgressStatusEnum,
    enumName: "tour_progress_status",
    default: TourProgressStatusEnum.InProgress,
  })
  status!: TourProgressStatusEnum;

  /** The next stable step identifier to show when an in-progress tour resumes. */
  @Column({ name: "current_step_id", type: "text", nullable: true })
  currentStepId!: string | null;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt!: Date | null;

  @Column({ name: "skipped_at", type: "timestamptz", nullable: true })
  skippedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
