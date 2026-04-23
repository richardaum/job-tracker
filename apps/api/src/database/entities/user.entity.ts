import { randomUUID } from "node:crypto";
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @BeforeInsert()
  setId(): void {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @Column({ name: "google_id", type: "text", unique: true })
  googleId!: string;

  @Column({ type: "text", unique: true })
  email!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ name: "avatar_url", type: "text", nullable: true })
  avatarUrl!: string | null;

  @Column({
    type: "enum",
    enum: ["user"],
    enumName: "role",
    default: "user",
  })
  role!: "user";

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;
}
