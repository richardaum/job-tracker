import { registerEnumType } from "@nestjs/graphql";

export enum RoleEnum {
  User = "user",
  Admin = "admin",
}

registerEnumType(RoleEnum, { name: "Role" });
