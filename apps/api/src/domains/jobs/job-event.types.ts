import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class JobSummaryStatusEventType {
  @Field(() => ID)
  jobId!: string;

  @Field()
  status!: string;
}

@ObjectType()
export class JobFillStatusEventType {
  @Field(() => ID)
  jobId!: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class JobMatchStatusEventType {
  @Field(() => ID)
  jobId!: string;

  @Field(() => ID)
  matchId!: string;

  @Field()
  status!: string;
}
