import { registerEnumType } from "@nestjs/graphql";

/** Matches PostgreSQL `application_source` enum labels after T-223 migration. */
export enum ApplicationSourceEnum {
  LINKEDIN = "LINKEDIN",
  JACK = "JACK",
  WELLFOUND = "WELLFOUND",
  REMOTE_YEAH = "REMOTE_YEAH",
}

registerEnumType(ApplicationSourceEnum, { name: "ApplicationSource" });
