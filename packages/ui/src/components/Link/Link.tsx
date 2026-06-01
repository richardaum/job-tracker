import type { AnchorHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@ui/lib/cn";

export type LinkVariant = "default" | "muted";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  asChild?: boolean;
}

const variantClasses: Record<LinkVariant, string> = {
  default: "text-text-brand hover:text-text-primary",
  muted: "text-text-secondary hover:text-text-primary",
};

export function Link({ variant = "default", className, children, asChild, ...props }: LinkProps) {
  const Component = asChild ? Slot : "a";
  const classes = cn(
    "inline-flex cursor-pointer items-center gap-2 text-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
    variantClasses[variant],
    className,
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
