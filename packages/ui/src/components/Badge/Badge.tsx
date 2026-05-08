import { cn } from "@ui/lib/cn";
import React from "react";

export type BadgeIntent = "default" | "success" | "warning" | "error" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: BadgeIntent;
}

const intentClasses: Record<BadgeIntent, string> = {
  default: "bg-bg-surface text-text-secondary",
  success: "bg-bg-success-subtle text-text-success",
  warning: "bg-bg-warning-subtle text-text-warning",
  error: "bg-bg-error-subtle text-text-error",
  info: "bg-bg-info-subtle text-text-brand",
};

export function Badge({
  intent = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  const classes = cn(
    "inline-flex items-center rounded border border-current/20 px-1.5 py-0.5 text-[11px]/4 font-normal ",
    intentClasses[intent],
    className,
  );

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
