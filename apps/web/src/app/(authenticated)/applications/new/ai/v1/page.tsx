import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata(
  "New AI application (prompt)",
);

export { default } from "@/modules/applications/create-ai/page/AiApplicationCreatePage";
