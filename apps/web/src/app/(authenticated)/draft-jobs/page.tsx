import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Draft jobs");

export { default } from "@/modules/draft-jobs/list/page/DraftJobsPage";
