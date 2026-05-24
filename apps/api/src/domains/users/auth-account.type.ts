import { Field, ID, ObjectType } from "@nestjs/graphql";

import { AuthProviderEnum } from "./auth-provider.enum";

@ObjectType("AuthAccount")
export class AuthAccountType {
  @Field(() => ID)
  id!: string;

  @Field(() => AuthProviderEnum)
  providerName!: AuthProviderEnum;

  @Field()
  providerAccountId!: string;

  @Field()
  createdAt!: Date;
}
