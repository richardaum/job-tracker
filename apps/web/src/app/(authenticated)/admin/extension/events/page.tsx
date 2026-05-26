import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata(
  "Admin · Extension · Events",
);

export { default } from "@/modules/admin/extension/page/ExtensionEventsPage";
