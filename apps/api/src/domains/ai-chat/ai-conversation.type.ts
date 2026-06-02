import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AiConversationType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  jobId!: string;

  @Field()
  title!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
