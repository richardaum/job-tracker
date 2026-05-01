import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Company details");

export { default } from "@/modules/companies/details/page/CompanyDetailsPage";
