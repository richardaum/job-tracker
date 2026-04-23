import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "@api/domains/users/users.schema";
import { applications } from "./applications.schema";

export const applicationStage = pgEnum("application_stage", [
  "new",
  "applied",
  "recruiter_screen",
  "technical",
  "offer",
  "rejected",
]);

export const applicationStageEvents = pgTable("application_stage_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fromStage: applicationStage("from_stage"),
  toStage: applicationStage("to_stage").notNull(),
  source: text("source").notNull().default("manual"),
  scheduledAt: timestamp("schedule_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ApplicationStageEvent = typeof applicationStageEvents.$inferSelect;
export type NewApplicationStageEvent =
  typeof applicationStageEvents.$inferInsert;
