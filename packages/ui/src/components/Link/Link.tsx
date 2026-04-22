import React from "react";
import { cn } from "@ui/lib/cn";

export type LinkVariant = "default" | "muted";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
}

const variantClasses: Record<LinkVariant, string> = {
  default: "text-text-brand hover:text-text-primary",
  muted: "text-text-secondary hover:text-text-primary",
};

export function Link({
  variant = "default",
  className,
  children,
  ...props
}: LinkProps) {
  const classes = cn(
    "inline-flex items-center gap-2 text-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
    variantClasses[variant],
    className,
  );

  return (
    <a className={classes} {...props}>
      {children}
    </a>
  );
}
