import { Field, ID, ObjectType } from "@nestjs/graphql";

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

  @Field()
  role!: string;
}
