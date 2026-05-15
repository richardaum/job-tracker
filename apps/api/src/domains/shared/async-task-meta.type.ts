import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum TaskStatus {
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}
registerEnumType(TaskStatus, { name: "TaskStatus" });

export interface AsyncTaskMeta {
  status: TaskStatus;
  error?: string;
  generatedAt?: string;
}

@ObjectType()
export class AsyncTaskMetaType {
  @Field(() => TaskStatus)
  status!: TaskStatus;

  @Field(() => String, { nullable: true })
  error?: string | null;

  @Field(() => String, { nullable: true })
  generatedAt?: string | null;
}
