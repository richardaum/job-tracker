import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationQuickFilterEnum {
  DRAFT = "DRAFT",
  INCOMING = "INCOMING",
  ACTIVE = "ACTIVE",
  APPLIED = "APPLIED",
  NEW = "NEW",
  DUPLICATED = "DUPLICATED",
  REJECTED = "REJECTED",
}

registerEnumType(ApplicationQuickFilterEnum, { name: "ApplicationQuickFilter" });
