import { randomUUID } from "node:crypto";

import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";

import { ApplicationEntity } from "./application.entity";

/** DB enforces case- and whitespace-insensitive uniqueness via `UQ_companies_user_lower_name` (see migrations). */
@Entity({ name: "companies" })
@Unique(["userId", "name"])
export class CompanyEntity {
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
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @OneToMany(() => ApplicationEntity, (application) => application.company)
  applications!: ApplicationEntity[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
