import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Source runs");

export { default } from "@/modules/sources/page/SourceRunsPage";
