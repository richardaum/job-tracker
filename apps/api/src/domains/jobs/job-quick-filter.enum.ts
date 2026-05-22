import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationQuickFilterEnum {
  DRAFT = "DRAFT",
  INCOMING = "INCOMING",
  ACTIVE = "ACTIVE",
  APPLIED = "APPLIED",
  NEW = "NEW",
  DUPLICATED = "DUPLICATED",
}

registerEnumType(ApplicationQuickFilterEnum, { name: "JobQuickFilter" });
