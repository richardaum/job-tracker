import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Jobs");

export { default } from "@/modules/jobs/list/page/JobsPage";
