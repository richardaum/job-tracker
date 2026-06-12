import { PubSub } from "@api/domains/shared/pubsub";
import { Injectable } from "@nestjs/common";

import type { AiChatPubSubEvents } from "./ai-chat-event.types";

@Injectable()
export class AiChatPubSub extends PubSub<AiChatPubSubEvents> {}
