import { registerEnumType } from "@nestjs/graphql";

/** Matches PostgreSQL `application_source` enum labels. */
export enum ApplicationSource {
  LINKEDIN = "Linkedin",
  JACK = "Jack",
  WELLFOUND = "Wellfound",
  REMOTE_YEAH = "RemoteYeah",
}

registerEnumType(ApplicationSource, { name: "ApplicationSource" });
