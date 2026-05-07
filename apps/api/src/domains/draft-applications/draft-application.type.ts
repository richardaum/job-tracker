import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DraftApplicationType {
  @Field(() => ID)
  id!: string;

  @Field()
  url!: string;

  @Field()
  htmlContent!: string;
}
