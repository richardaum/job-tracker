import { RoleEnum } from "@api/domains/users/role.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { UserAccountEntity } from "./user-account.entity";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ type: "text", unique: true })
  email!: string;

  @OneToMany(() => UserAccountEntity, (account) => account.user, {
    cascade: false,
  })
  accounts!: UserAccountEntity[];

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

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
