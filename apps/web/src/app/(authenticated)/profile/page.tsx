import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Identity");

export { default } from "@/modules/profile/identity/page/IdentityTabPage";
