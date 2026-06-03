import { Field, ID, ObjectType } from "@nestjs/graphql";
import { AiMessageRoleEnum } from "./ai-message-role.enum";

@ObjectType()
export class AiMessageType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  conversationId!: string;

  @Field(() => AiMessageRoleEnum)
  role!: AiMessageRoleEnum;

  @Field()
  content!: string;

  @Field()
  createdAt!: Date;
}
