import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Applications");

export { default } from "@/modules/applications/list/page/ApplicationsPage";
