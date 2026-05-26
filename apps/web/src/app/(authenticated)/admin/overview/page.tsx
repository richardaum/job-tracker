import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Admin · Overview");

export { default } from "@/modules/admin/overview/page/OverviewPage";
