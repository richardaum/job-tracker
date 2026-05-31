import { registerEnumType } from "@nestjs/graphql";

/** Matches PostgreSQL `application_source` enum labels after T-223 migration. */
export enum ApplicationSourceEnum {
  Linkedin = "Linkedin",
  Jack = "Jack",
  Wellfound = "Wellfound",
  RemoteYeah = "RemoteYeah",
}

registerEnumType(ApplicationSourceEnum, { name: "JobSource" });
