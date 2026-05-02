import { Field, ID, ObjectType } from "@nestjs/graphql";

import { ImportRunStatusEnum } from "./import-run-status.enum";

@ObjectType()
export class ImportRunType {
  @Field(() => ID)
  id!: string;

  @Field()
  importerId!: string;

  @Field()
  importerName!: string;

  /** Where the importer run begins (e.g. RemoteYeah job board URL). */
  @Field()
  entryUrl!: string;

  @Field(() => ImportRunStatusEnum)
  status!: ImportRunStatusEnum;

  @Field()
  startedAt!: Date;

  /** Aligns with web `ImportRun.importerSource`: server-backed runs use `database`. */
  @Field()
  importerSource!: string;
}
