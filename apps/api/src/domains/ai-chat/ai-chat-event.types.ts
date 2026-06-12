import { Field, ID, ObjectType } from "@nestjs/graphql";

import { AiChatSubEventEnum } from "./ai-chat-sub-event.enum";
import { AiMessageStreamPhaseEnum } from "./ai-message-stream-phase.enum";

export type AiChatRequestedPayload = {
  conversationId: string;
  userId: string;
  jobId: string;
  content: string;
  userMessageId: string;
};

export type AiChatPubSubEvents = {
  [AiChatSubEventEnum.AiMessageStreamed]: AiMessageStreamEventType;
  [AiChatSubEventEnum.AiChatRequested]: AiChatRequestedPayload;
};

@ObjectType()
export class AiMessageStreamEventType {
  @Field(() => ID)
  conversationId!: string;

  @Field(() => AiMessageStreamPhaseEnum)
  phase!: AiMessageStreamPhaseEnum;

  @Field(() => String, { nullable: true })
  token?: string | null;

  @Field(() => ID, { nullable: true })
  userMessageId?: string | null;

  @Field(() => ID, { nullable: true })
  aiMessageId?: string | null;

  @Field(() => String, { nullable: true })
  error?: string | null;
}
