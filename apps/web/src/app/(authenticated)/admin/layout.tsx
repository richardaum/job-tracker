import type { ReactNode } from "react";

import { AdminShell } from "@/modules/admin/layout/page/AdminShell";

type AdminLayoutProps = { children: ReactNode };
export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}
