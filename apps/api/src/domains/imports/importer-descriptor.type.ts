import { Field, ObjectType } from "@nestjs/graphql";

import { ImportTemplateType } from "./import-template.type";

/** Importer known to the API (has a server-held executor plan). */
@ObjectType()
export class ImporterDescriptorType {
  @Field()
  importerId!: string;

  @Field()
  name!: string;

  @Field(() => [ImportTemplateType])
  templates?: ImportTemplateType[];
}
