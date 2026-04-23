import type { Metadata } from "next";
import type { ReactNode } from "react";
import { staticPageMetadata } from "@/app/metadata";

export const metadata: Metadata = staticPageMetadata("Login");

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
