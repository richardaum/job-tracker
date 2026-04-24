import { InputType, Field, Int } from "@nestjs/graphql";
import { SalaryPeriodEnum } from "./salary-period.enum";

@InputType()
export class UpdateApplicationInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  company?: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  url?: string | null;

  @Field(() => Int, { nullable: true })
  salaryMinCents?: number | null;

  @Field(() => Int, { nullable: true })
  salaryMaxCents?: number | null;

  @Field(() => String, { nullable: true })
  salaryCurrency?: string | null;

  @Field(() => SalaryPeriodEnum, { nullable: true })
  salaryPeriod?: SalaryPeriodEnum | null;

  @Field(() => [String], { nullable: true })
  tags?: string[] | null;
}
