import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateImportRunInput {
  /** Registry key, e.g. `remoteyeah`. */
  @Field()
  importerId!: string;
}
