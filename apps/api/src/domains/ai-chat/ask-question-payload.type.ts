import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AskQuestionPayloadType {
  @Field()
  success!: boolean;
}
