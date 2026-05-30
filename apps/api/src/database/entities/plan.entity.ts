import { type ExecutorPlanDocument } from "@api/domains/sources/plan.types";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { SourceTemplateEntity } from "./source-template.entity";

@Entity({ name: "plans" })
export class PlanEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "display_name", type: "varchar", length: 256 })
  displayName!: string;

  @Column({ type: "jsonb" })
  document!: ExecutorPlanDocument;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => SourceTemplateEntity, (t) => t.plan)
  templates?: SourceTemplateEntity[];
}
