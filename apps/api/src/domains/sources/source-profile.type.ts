import { Field, ObjectType } from "@nestjs/graphql";

import { SourceTemplateType } from "./source-template.type";

/** Source profile known to the API (has a server-held executor plan). */
@ObjectType()
export class SourceProfileType {
  @Field()
  sourceProfileId!: string;

  @Field()
  name!: string;

  @Field(() => [SourceTemplateType])
  templates?: SourceTemplateType[];
}
