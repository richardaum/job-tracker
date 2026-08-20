import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";
import SettingsTabPage from "@/modules/profile/settings/page/SettingsTabPage";

export const metadata: Metadata = staticPageMetadata("Settings");

export default function SettingsPage() {
  return <SettingsTabPage />;
}
