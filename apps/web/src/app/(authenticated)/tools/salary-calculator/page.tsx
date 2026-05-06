import type { Metadata } from "next";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Salary Calculator");

export { SalaryCalculatorPage as default } from "@/modules/tools/salary-calculator/page/SalaryCalculatorPage";
