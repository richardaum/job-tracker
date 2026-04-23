import { ObjectType, Field, ID } from "@nestjs/graphql";

@ObjectType()
export class ApplicationType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  title!: string;

  @Field()
  company!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
