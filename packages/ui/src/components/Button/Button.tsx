import React from "react";
import { cn } from "@ui/lib/cn";

export type ButtonIntent =
  | "primary"
  | "secondary"
  | "ghost"
  | "outlined"
  | "destructive";
export type ButtonSize = "sm" | "md";
export type ButtonState = "default" | "loading";

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "size"
> {
  intent?: ButtonIntent;
  size?: ButtonSize;
  state?: ButtonState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const intentClasses: Record<ButtonIntent, string> = {
  primary:
    "border-transparent bg-bg-brand text-text-inverted hover:bg-bg-brand-hover",
  secondary:
    "border-border-default bg-bg-surface text-text-primary hover:bg-bg-surface-hover",
  ghost:
    "border-transparent bg-transparent text-text-brand shadow-none hover:bg-bg-brand-subtle",
  outlined:
    "border-border-default bg-transparent text-text-primary shadow-none hover:bg-bg-surface-hover",
  destructive:
    "border-border-error bg-bg-error-subtle text-text-error hover:bg-bg-surface",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-sm",
  md: "px-5 py-3 text-base",
};

const stateClasses: Record<ButtonState, string> = {
  default: "",
  loading: "cursor-wait opacity-80",
};

export function Button({
  children,
  intent = "primary",
  size = "md",
  state = "default",
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || state === "loading";
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
    intentClasses[intent],
    sizeClasses[size],
    stateClasses[state],
    className,
  );

  return (
    <button
      type="button"
      {...props}
      disabled={isDisabled}
      aria-busy={state === "loading" ? true : undefined}
      className={classes}
    >
      {leftIcon ? <span aria-hidden>{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span aria-hidden>{rightIcon}</span> : null}
    </button>
  );
}
