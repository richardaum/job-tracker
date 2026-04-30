import type { Metadata } from "next";
import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Companies");

export { default } from "@/modules/companies/list/page/CompaniesPage";
