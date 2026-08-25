import type { Metadata } from "next";

export const APP_TITLE = "NewJobTracker";
export const APP_DESCRIPTION =
  "Paste a job posting and NewJobTracker drafts the application, scores your fit against your resume, and carries it through every stage to a signed offer.";
export const TITLE_TEMPLATE = `%s | ${APP_TITLE}`;
export const SITE_URL = "https://newjobtracker.app";

export function staticPageMetadata(title: string): Metadata {
  return { title };
}
