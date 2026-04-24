import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class CompanyType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
