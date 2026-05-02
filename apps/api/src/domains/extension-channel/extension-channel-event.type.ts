import { Field, ObjectType } from "@nestjs/graphql";

/** Events streamed to the browser extension over GraphQL-over-SSE (import orchestration channel). */
@ObjectType()
export class ExtensionChannelEventType {
  @Field(() => String)
  kind!: string;

  @Field(() => String, { nullable: true })
  payloadJson?: string | null;
}
