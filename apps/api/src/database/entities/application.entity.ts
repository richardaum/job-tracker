import { randomUUID } from "node:crypto";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "applications" })
export class ApplicationEntity {
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

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "text" })
  company!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "text", nullable: true })
  url!: string | null;

  @Column({ name: "salary_min_cents", type: "integer", nullable: true })
  salaryMinCents!: number | null;

  @Column({ name: "salary_max_cents", type: "integer", nullable: true })
  salaryMaxCents!: number | null;

  @Column({ name: "salary_currency", type: "text", nullable: true })
  salaryCurrency!: string | null;

  @Column({
    name: "salary_period",
    type: "enum",
    enum: ["year", "month", "hour"],
    enumName: "salary_period",
    nullable: true,
  })
  salaryPeriod!: "year" | "month" | "hour" | null;

  @Column({
    name: "salary_tags",
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  salaryTags!: string[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
