import { WithGeneratedId } from "@api/database/decorators/with-generated-id.decorator";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

import { JobEntity } from "./job.entity";

/** DB enforces case- and whitespace-insensitive uniqueness via `UQ_companies_user_lower_name` (see migrations). */
@WithGeneratedId()
@Entity({ name: "companies" })
@Unique(["userId", "name"])
export class CompanyEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @OneToMany(() => JobEntity, (job) => job.company)
  jobs!: JobEntity[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
