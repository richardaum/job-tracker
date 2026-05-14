import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Sources");

export { default } from "@/modules/sources/page/SourcesPage";
