import { registerEnumType } from "@nestjs/graphql";

export enum ApplicationQuickFilterEnum {
  ACTIVE = "active",
  INCOMING = "incoming",
  APPLIED = "applied",
  NEW = "new",
}

registerEnumType(ApplicationQuickFilterEnum, {
  name: "ApplicationQuickFilter",
});
