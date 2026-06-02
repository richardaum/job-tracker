import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AiMessageType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  conversationId!: string;

  @Field()
  role!: string;

  @Field()
  content!: string;

  @Field()
  createdAt!: Date;
}
