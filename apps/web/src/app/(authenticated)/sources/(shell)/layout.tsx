import { SourcesShell } from "@/modules/sources/layout/page/SourcesShell";

type ShellLayoutProps = { children: React.ReactNode };
export default function ShellLayout({ children }: ShellLayoutProps) {
  return <SourcesShell>{children}</SourcesShell>;
}
