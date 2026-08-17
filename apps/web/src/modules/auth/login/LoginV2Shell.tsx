"use client";

import { cn } from "@job-tracker/ui";
import type { ReactNode } from "react";

import { LoginV2Orbit } from "@/modules/auth/login/LoginV2Orbit";

type LoginV2ShellProps = { children: ReactNode };

/** Alternate login layout: a centered card with 4 tiles orbiting it — Google-account-style ([LoginV2]). */
export function LoginV2Shell({ children }: LoginV2ShellProps) {
  return (
    <main className={cn("flex min-h-svh items-center justify-center bg-bg-shell p-4")}>
      <div className={cn("w-full max-w-sm lg:hidden")}>{children}</div>

      <LoginV2Orbit className={cn("hidden lg:block")}>
        <div className={cn("w-full max-w-sm")}>{children}</div>
      </LoginV2Orbit>
    </main>
  );
}
