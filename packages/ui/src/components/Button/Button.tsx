import React from "react";

export type ButtonIntent = "primary" | "secondary" | "ghost" | "destructive";
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
  destructive:
    "border-border-error bg-bg-error-subtle text-text-error hover:bg-bg-surface",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-button-x py-button-y-sm text-sm",
  md: "px-button-x py-button-y-md text-base",
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
  const classes = [
    "inline-flex items-center justify-center gap-inline-gap rounded-md border font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    intentClasses[intent],
    sizeClasses[size],
    stateClasses[state],
    className,
  ]
    .filter(Boolean)
    .join(" ");

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
