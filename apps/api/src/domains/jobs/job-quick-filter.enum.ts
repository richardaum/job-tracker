import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationQuickFilterEnum {
  Draft = "Draft",
  Incoming = "Incoming",
  Active = "Active",
  Applied = "Applied",
  New = "New",
  Duplicated = "Duplicated",
  Rejected = "Rejected",
}

registerEnumType(ApplicationQuickFilterEnum, { name: "ApplicationQuickFilter" });
