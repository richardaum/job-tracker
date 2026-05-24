import { RoleEnum } from "@api/domains/users/role.enum";
import {
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
    enum: RoleEnum,
    enumName: "role",
    default: RoleEnum.User,
  })
  role!: RoleEnum;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @Column({ name: "token_version", type: "integer", default: 0 })
  tokenVersion!: number;

  @Column({ name: "refresh_jti", type: "uuid", nullable: true })
  refreshJti!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
