import React from "react";

export type BadgeIntent = "default" | "success" | "warning" | "error" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  intent?: BadgeIntent;
}

const intentClasses: Record<BadgeIntent, string> = {
  default: "bg-bg-surface text-text-secondary border-border-default",
  success: "bg-bg-success-subtle text-text-success border-border-default",
  warning: "bg-bg-warning-subtle text-text-warning border-border-default",
  error: "bg-bg-error-subtle text-text-error border-border-error",
  info: "bg-bg-info-subtle text-text-brand border-border-brand",
};

export function Badge({
  intent = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  const classes = [
    "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
    intentClasses[intent],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
