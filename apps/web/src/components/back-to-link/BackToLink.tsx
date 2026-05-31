"use client";

import { cn } from "@job-tracker/ui";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const backLinkClassName = cn("text-sm text-text-secondary underline-offset-2 hover:underline");

export type BackToLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "href"> & {
  children: ReactNode;
  className?: string;
  href: Route;
};

/** Header “Back to …” nav link shared across entity detail layouts. */
export function BackToLink({ href, children, className, ...rest }: BackToLinkProps) {
  return (
    <Link href={href} className={cn(backLinkClassName, className)} {...rest}>
      {children}
    </Link>
  );
}
