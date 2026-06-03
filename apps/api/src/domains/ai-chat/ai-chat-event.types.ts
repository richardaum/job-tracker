import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AiMessageStreamEventType {
  @Field(() => ID)
  conversationId!: string;

  @Field(() => String, { nullable: true })
  token?: string | null;

  @Field()
  completed!: boolean;

  @Field(() => ID, { nullable: true })
  userMessageId?: string | null;

  @Field(() => ID, { nullable: true })
  aiMessageId?: string | null;

  @Field(() => String, { nullable: true })
  error?: string | null;
}
