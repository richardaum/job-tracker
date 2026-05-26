import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata(
  "Admin · Extension · Status",
);

export { default } from "@/modules/admin/extension/page/ExtensionStatusPage";
