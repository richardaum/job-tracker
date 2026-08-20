import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("AI Usage");

export { default } from "@/modules/profile/ai-usage/page/AiUsageTabPage";
