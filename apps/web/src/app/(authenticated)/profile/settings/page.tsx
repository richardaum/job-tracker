import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Settings");

export { default } from "@/modules/profile/settings/page/SettingsTabPage";
