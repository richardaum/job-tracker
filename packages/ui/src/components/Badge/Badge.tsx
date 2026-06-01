import type { HTMLAttributes } from "react";
import { cn } from "@ui/lib/cn";

export type BadgeIntent = "default" | "success" | "warning" | "error" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  intent?: BadgeIntent;
  interactive?: boolean;
}

/**
 * AA light (~11px). On white `surface`: default chips use a slim neutral outline;
 * tinted intents skip grey rims so pastels aren’t edged with “dirty” neutral.
 */
const intentClasses: Record<BadgeIntent, string> = {
  default: "border-border-default bg-bg-field text-text-secondary",
  success: "border-transparent bg-bg-success-subtle text-[color:var(--primitive-color-green-700)]",
  warning: "border-transparent bg-bg-warning-subtle text-[color:var(--primitive-color-yellow-950)]",
  error: "border-transparent bg-bg-error-subtle text-[color:var(--primitive-color-red-700)]",
  info: "border-transparent bg-bg-info-subtle text-text-primary",
};

export function Badge({ intent = "default", interactive, className, children, ...props }: BadgeProps) {
  const classes = cn(
    "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px]/4 font-normal",
    intentClasses[intent],
    interactive && "cursor-pointer hover:opacity-70",
    className,
  );

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
