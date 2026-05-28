import { type ExecutorPlanDocument } from "@api/domains/sources/source-profiles";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "plans" })
export class PlanEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "source_profile_id",
    type: "varchar",
    length: 256,
    unique: true,
  })
  sourceProfileId!: string;

  @Column({ name: "display_name", type: "varchar", length: 256 })
  displayName!: string;

  @Column({ type: "jsonb" })
  document!: ExecutorPlanDocument;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
