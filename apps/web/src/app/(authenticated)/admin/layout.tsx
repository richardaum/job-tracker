import type { ReactNode } from "react";

import { AdminShell } from "@/modules/admin/layout/page/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
