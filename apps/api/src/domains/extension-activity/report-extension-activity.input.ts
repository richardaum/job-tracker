import { Field, InputType } from "@nestjs/graphql";
import { GraphQLJSON } from "graphql-type-json";

import { ExtensionActivityEventTypeEnum } from "./extension-activity-event-type.enum";

@InputType()
export class ReportExtensionActivityInput {
  @Field(() => ExtensionActivityEventTypeEnum)
  type!: ExtensionActivityEventTypeEnum;

  @Field()
  summary!: string;

  @Field(() => String, { nullable: true })
  correlationId?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  payload?: Record<string, unknown> | null;

  @Field(() => String, { nullable: true })
  extensionVersion?: string | null;

  @Field(() => String, { nullable: true })
  browser?: string | null;

  @Field(() => Date, { nullable: true })
  occurredAt?: Date | null;
}
