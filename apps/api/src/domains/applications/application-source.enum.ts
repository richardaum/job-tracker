import { registerEnumType } from "@nestjs/graphql";

/** Matches PostgreSQL `application_source` enum labels. */
export enum ApplicationSource {
  LINKEDIN = "Linkedin",
  JACK = "Jack",
  WELLFOUND = "Wellfound",
}

registerEnumType(ApplicationSource, { name: "ApplicationSource" });
