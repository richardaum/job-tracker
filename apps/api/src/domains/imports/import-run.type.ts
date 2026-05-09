import { Field, ID, ObjectType } from "@nestjs/graphql";

import { ImportRunStatusEnum } from "./import-run-status.enum";

@ObjectType()
export class ImportRunType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  templateId!: string;

  @Field()
  importerId!: string;

  /** Surface/listing URL for this execution (persisted). */
  @Field(() => String)
  surfaceUrl!: string;

  @Field(() => ImportRunStatusEnum)
  status!: ImportRunStatusEnum;

  @Field()
  startedAt!: Date;

  /** Aligns with web `ImportRun.importerSource`: server-backed runs use `database`. */
  @Field()
  importerSource!: string;
}
