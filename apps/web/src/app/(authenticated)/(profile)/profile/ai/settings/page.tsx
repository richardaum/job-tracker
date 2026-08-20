import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";
import AiSettingsTabPage from "@/modules/profile/ai/settings/page/AiSettingsTabPage";

export const metadata: Metadata = staticPageMetadata("AI Settings");

export default function AiSettingsPage() {
  return <AiSettingsTabPage />;
}
