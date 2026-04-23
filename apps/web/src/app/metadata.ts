import type { Metadata } from "next";

export const APP_TITLE = "Job Tracker";
export const APP_DESCRIPTION = "Track your job applications";
export const TITLE_TEMPLATE = `%s | ${APP_TITLE}`;

export function staticPageMetadata(title: string): Metadata {
  return { title };
}
