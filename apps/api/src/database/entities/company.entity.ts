import { randomUUID } from "node:crypto";

import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { ApplicationEntity } from "./application.entity";

@Entity({ name: "companies" })
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
