import { ObjectType, Field, ID, Int } from "@nestjs/graphql";
import { SalaryPeriodEnum } from "./salary-period.enum";

@ObjectType()
export class ApplicationType {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  title!: string;

  @Field()
  company!: string;

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
  salaryTags!: string[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
