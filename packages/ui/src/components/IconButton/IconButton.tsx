import { Slot } from "@radix-ui/react-slot";
import { Tooltip } from "@ui/components/Tooltip/Tooltip";
import { cn } from "@ui/lib/cn";
import React from "react";

export type IconButtonIntent =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive";
export type IconButtonSize = "sm" | "md";

export interface IconButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "size" | "children"
> {
  icon?: React.ReactNode;
  label: string;
  tooltip: React.ReactNode;
  intent?: IconButtonIntent;
  size?: IconButtonSize;
  asChild?: boolean;
  children?: React.ReactNode;
}

const intentClasses: Record<IconButtonIntent, string> = {
  primary:
    "border-transparent bg-bg-brand text-text-inverted hover:bg-bg-brand-hover data-[state=open]:bg-bg-brand-hover",
  secondary:
    "border-[1.5px] border-border-default bg-bg-surface text-text-primary hover:bg-bg-surface-hover data-[state=open]:bg-bg-surface-hover",
  ghost:
    "border-transparent bg-transparent text-text-brand shadow-none hover:bg-bg-brand-subtle data-[state=open]:bg-bg-brand-subtle",
  destructive:
    "border-border-error bg-bg-error-subtle text-text-error hover:bg-bg-surface data-[state=open]:bg-bg-surface",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-9",
  md: "size-10",
};

export function IconButton({
  icon,
  label,
  tooltip,
  intent = "secondary",
  size = "md",
  className,
  asChild,
  children,
  ...props
}: IconButtonProps) {
  const Component = asChild ? Slot : "button";
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
    intentClasses[intent],
    sizeClasses[size],
    className,
  );

  return (
    <Tooltip content={tooltip}>
      <Component
        {...(asChild ? {} : { type: "button" as const })}
        aria-label={label}
        className={classes}
        {...props}
      >
        {asChild ? children : <span aria-hidden>{icon}</span>}
      </Component>
    </Tooltip>
  );
}
