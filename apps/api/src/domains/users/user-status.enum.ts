import { registerEnumType } from "@nestjs/graphql";

export enum UserStatusEnum {
  Pending = "Pending",
  Active = "Active",
  Rejected = "Rejected",
  Deactivated = "Deactivated",
}

registerEnumType(UserStatusEnum, { name: "UserStatus" });
