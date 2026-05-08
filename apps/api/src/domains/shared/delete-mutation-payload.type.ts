import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DeleteMutationPayloadType {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => ID)
  deletedId!: string;
}
