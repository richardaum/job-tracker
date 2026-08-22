import { RoleEnum } from "@api/domains/users/role.enum";
import { UserStatusEnum } from "@api/domains/users/user-status.enum";
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ type: "text", unique: true })
  email!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ name: "avatar_url", type: "text", nullable: true })
  avatarUrl!: string | null;

  @Column({ type: "enum", enum: RoleEnum, enumName: "role", default: RoleEnum.User })
  role!: RoleEnum;

  @Column({ type: "enum", enum: UserStatusEnum, enumName: "user_status", default: UserStatusEnum.Active })
  status!: UserStatusEnum;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
