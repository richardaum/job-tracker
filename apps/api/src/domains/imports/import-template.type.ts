import { Field, ID, ObjectType } from "@nestjs/graphql";

import { ImportRunType } from "./import-run.type";

@ObjectType()
export class ImportTemplateType {
  @Field(() => ID)
  id!: string;

  @Field()
  importerId!: string;

  @Field(() => String, { nullable: true })
  scheduleCron!: string | null;

  @Field()
  scheduleEnabled!: boolean;

  @Field(() => String)
  surfaceUrl!: string;

  @Field()
  createdAt!: Date;

  @Field(() => [ImportRunType])
  runs!: ImportRunType[];
}
