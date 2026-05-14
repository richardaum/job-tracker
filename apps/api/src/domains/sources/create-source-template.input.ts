import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateSourceTemplateInput {
  /** Registry key, e.g. `remoteyeah`. */
  @Field()
  sourceProfileId!: string;

  /** Initial surface/listing URL for the template. */
  @Field()
  surfaceUrl!: string;
}
