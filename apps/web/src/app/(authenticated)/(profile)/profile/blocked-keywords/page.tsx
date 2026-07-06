import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Blocked Keywords");

export { default } from "@/modules/profile/blocked-keywords/page/BlockedKeywordsTabPage";
