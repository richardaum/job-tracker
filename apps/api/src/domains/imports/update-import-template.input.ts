import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class UpdateImportTemplateInput {
  @Field(() => String, { nullable: true })
  scheduleCron?: string | null;

  @Field(() => Boolean, { nullable: true })
  scheduleEnabled?: boolean | null;

  @Field(() => String, { nullable: true })
  surfaceUrl?: string;
}
