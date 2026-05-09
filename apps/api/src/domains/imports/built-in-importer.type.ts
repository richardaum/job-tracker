import { Field, ObjectType } from "@nestjs/graphql";

/** Available built-in importer (has a server-held executor plan). */
@ObjectType()
export class BuiltInImporterType {
  @Field()
  importerId!: string;

  @Field()
  name!: string;
}
