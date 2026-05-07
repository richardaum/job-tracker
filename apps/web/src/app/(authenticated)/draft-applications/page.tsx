import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Draft applications");

export { default } from "@/modules/draft-applications/list/page/DraftApplicationsPage";
