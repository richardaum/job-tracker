import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "@api/domains/users/users.schema";

export const salaryPeriodDrizzle = pgEnum("salary_period", [
  "year",
  "month",
  "hour",
]);

export const applications = pgTable("applications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  url: text("url"),
  salaryMinCents: integer("salary_min_cents"),
  salaryMaxCents: integer("salary_max_cents"),
  salaryCurrency: text("salary_currency"),
  salaryPeriod: salaryPeriodDrizzle("salary_period"),
  salaryTags: text("salary_tags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
