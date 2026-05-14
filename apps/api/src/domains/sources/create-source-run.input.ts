import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateSourceRunInput {
  /** Registry key, e.g. `remoteyeah`. */
  @Field()
  sourceProfileId!: string;
}
