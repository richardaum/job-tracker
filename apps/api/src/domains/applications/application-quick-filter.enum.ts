import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationQuickFilterEnum {
  INCOMING = "incoming",
  ACTIVE = "active",
  APPLIED = "applied",
  NEW = "new",
  DUPLICATED = "duplicated",
}

registerEnumType(ApplicationQuickFilterEnum, {
  name: "ApplicationQuickFilter",
});
