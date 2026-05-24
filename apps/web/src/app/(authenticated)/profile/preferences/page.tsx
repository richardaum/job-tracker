import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Work Preferences");

export { default } from "@/modules/profile/preferences/page/PreferencesTabPage";
