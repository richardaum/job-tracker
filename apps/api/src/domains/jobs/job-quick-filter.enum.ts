import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationQuickFilterEnum {
  INCOMING = "INCOMING",
  ACTIVE = "ACTIVE",
  APPLIED = "APPLIED",
  NEW = "NEW",
  DUPLICATED = "DUPLICATED",
}

registerEnumType(ApplicationQuickFilterEnum, { name: "JobQuickFilter" });
