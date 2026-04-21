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
  icon: React.ReactNode;
  label: string;
  intent?: IconButtonIntent;
  size?: IconButtonSize;
}

const intentClasses: Record<IconButtonIntent, string> = {
  primary:
    "border-transparent bg-bg-brand text-text-inverted hover:bg-bg-brand-hover",
  secondary:
    "border-border-default bg-bg-surface text-text-primary hover:bg-bg-surface-hover",
  ghost:
    "border-transparent bg-transparent text-text-brand shadow-none hover:bg-bg-brand-subtle",
  destructive:
    "border-border-error bg-bg-error-subtle text-text-error hover:bg-bg-surface",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-9",
  md: "size-10",
};

export function IconButton({
  icon,
  label,
  intent = "secondary",
  size = "md",
  className,
  ...props
}: IconButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-md border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    intentClasses[intent],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" aria-label={label} className={classes} {...props}>
      <span aria-hidden>{icon}</span>
    </button>
  );
}
