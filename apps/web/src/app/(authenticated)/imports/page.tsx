import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Imports");

export { default } from "@/modules/imports/page/ImportsPage";
