import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { CompanyType } from "@api/domains/companies/company.type";
import { SalaryPeriodEnum } from "./salary-period.enum";

@ObjectType()
export class ApplicationType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  title!: string;

  @Field(() => ID)
  companyId!: string;

  @Field(() => CompanyType)
  company!: CompanyType;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  url!: string | null;

  @Field(() => Int, { nullable: true })
  salaryMinCents?: number | null;

  @Field(() => Int, { nullable: true })
  salaryMaxCents?: number | null;

  @Field(() => String, { nullable: true })
  salaryCurrency?: string | null;

  @Field(() => SalaryPeriodEnum, { nullable: true })
  salaryPeriod?: string | null;

  @Field(() => [String])
  tags!: string[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
