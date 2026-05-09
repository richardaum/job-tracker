import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateImportTemplateInput {
  /** Registry key, e.g. `remoteyeah`. */
  @Field()
  importerId!: string;

  /** Initial surface/listing URL for the template. */
  @Field()
  surfaceUrl!: string;
}
