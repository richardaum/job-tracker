import { Field, ID, ObjectType } from "@nestjs/graphql";
import { GraphQLJSON } from "graphql-type-json";

import { ExtensionActivityEventTypeEnum } from "./extension-activity-event-type.enum";

@ObjectType()
export class ExtensionActivityEvent {
  @Field(() => ID, { description: "Unique event identifier." })
  id!: string;

  @Field(() => ExtensionActivityEventTypeEnum, { description: "Event category (source run lifecycle, import, auth)." })
  type!: ExtensionActivityEventTypeEnum;

  @Field({ description: "Human-readable summary of what happened." })
  summary!: string;

  @Field(() => String, { nullable: true, description: "Groups related events (e.g. run ID)." })
  correlationId!: string | null;

  @Field(() => GraphQLJSON, { nullable: true, description: "Arbitrary JSON payload with event details." })
  payload!: Record<string, unknown> | null;

  @Field(() => String, { nullable: true, description: "Extension version that reported the event." })
  extensionVersion!: string | null;

  @Field(() => String, { nullable: true, description: "Browser user-agent or name." })
  browser!: string | null;

  @Field({ description: "When the event actually happened (client-reported)." })
  occurredAt!: Date;
}
