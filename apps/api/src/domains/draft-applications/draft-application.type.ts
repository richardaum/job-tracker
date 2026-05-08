import { DraftApplicationConversionStatus } from "@api/database/entities/draft-application.entity";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(DraftApplicationConversionStatus, {
  name: "DraftApplicationConversionStatus",
});

@ObjectType()
export class DraftApplicationType {
  @Field(() => ID)
  id!: string;

  @Field()
  url!: string;

  @Field()
  title!: string;

  @Field()
  htmlContent!: string;

  @Field(() => String, { nullable: true })
  applicationId!: string | null;

  @Field(() => DraftApplicationConversionStatus)
  conversionStatus!: DraftApplicationConversionStatus;

  @Field(() => String, { nullable: true })
  conversionError!: string | null;
}
