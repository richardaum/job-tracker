import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum AsyncMetadataStatusEnum {
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}
registerEnumType(AsyncMetadataStatusEnum, { name: "AsyncMetadataStatus" });

export interface AsyncMetadata {
  status: AsyncMetadataStatusEnum;
  error?: string;
  timestamp?: string;
}

@ObjectType()
export class AsyncMetadataType {
  @Field(() => AsyncMetadataStatusEnum, { nullable: true })
  status?: AsyncMetadataStatusEnum | null;

  @Field(() => String, { nullable: true })
  error?: string | null;

  @Field(() => Date, { nullable: true })
  timestamp?: Date | null;
}
