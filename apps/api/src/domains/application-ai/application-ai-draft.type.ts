import { SalaryPeriodEnum } from "@api/domains/applications/salary-period.enum";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ApplicationAiDraftType {
  @Field()
  title!: string;

  @Field()
  company!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field(() => Int, { nullable: true })
  salaryMinCents!: number | null;

  @Field(() => Int, { nullable: true })
  salaryMaxCents!: number | null;

  @Field(() => String, { nullable: true })
  salaryCurrency!: string | null;

  @Field(() => SalaryPeriodEnum, { nullable: true })
  salaryPeriod!: SalaryPeriodEnum | null;

  @Field(() => [String])
  tags!: string[];

  @Field(() => [String])
  noteContents!: string[];
}
