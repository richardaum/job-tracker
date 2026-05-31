import { UserEntity } from "@api/database/entities/user.entity";
import { AuthProviderEnum } from "@api/domains/users/auth-provider.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

/** OAuth (or IdP) account linked to a user — one user can have many accounts over time / providers. */
@Entity({ name: "user_accounts" })
export class UserAccountEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.accounts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({
    type: "enum",
    enum: AuthProviderEnum,
    enumName: "auth_provider",
    name: "provider_name",
  })
  providerName!: AuthProviderEnum;

  @Column({ name: "provider_account_id", type: "text" })
  providerAccountId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
