import { SourcesShell } from "@/modules/sources/layout/page/SourcesShell";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SourcesShell>{children}</SourcesShell>;
}
