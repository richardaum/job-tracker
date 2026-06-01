import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";

import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Login");

type LoginLayoutProps = { children: ReactNode };
export default function LoginLayout({ children }: LoginLayoutProps) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
