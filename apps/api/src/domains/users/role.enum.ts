import { registerEnumType } from "@nestjs/graphql";

export enum RoleEnum {
  User = "User",
  Admin = "Admin",
}

registerEnumType(RoleEnum, { name: "Role" });
