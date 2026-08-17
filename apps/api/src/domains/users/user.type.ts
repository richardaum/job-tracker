import { Field, ID, ObjectType } from "@nestjs/graphql";

import { AuthAccountType } from "./auth-account.type";
import { RoleEnum } from "./role.enum";
import { UserStatusEnum } from "./user-status.enum";

@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  avatarUrl!: string | null;

  @Field(() => RoleEnum)
  role!: RoleEnum;

  @Field(() => UserStatusEnum)
  status!: UserStatusEnum;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => [AuthAccountType])
  accounts!: AuthAccountType[];
}
