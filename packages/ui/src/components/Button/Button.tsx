import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@ui/lib/cn";

export type ButtonIntent = "primary" | "secondary" | "ghost" | "outlined" | "destructive";
export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonState = "default" | "loading";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  intent?: ButtonIntent;
  size?: ButtonSize;
  state?: ButtonState;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

const intentClasses: Record<ButtonIntent, string> = {
  primary: "border-transparent bg-bg-brand text-text-inverted hover:bg-bg-brand-hover",
  secondary:
    "border-[1.5px] border-border-default bg-bg-surface text-text-primary shadow-none hover:bg-bg-surface-hover",
  ghost: "border-transparent bg-transparent text-text-brand shadow-none hover:bg-bg-brand-subtle",
  outlined: "border-border-default bg-transparent text-text-primary shadow-none hover:bg-bg-surface-hover",
  destructive: "border-border-error bg-bg-error-subtle text-text-error hover:bg-bg-surface",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs",
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Button({
  children,
  intent = "primary",
  size = "md",
  state = "default",
  leftIcon,
  rightIcon,
  asChild,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isLoading = state === "loading";
  const isDisabled = disabled || isLoading;
  const Component = asChild ? Slot : "button";
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
    intentClasses[intent],
    sizeClasses[size],
    isLoading && "cursor-wait opacity-80",
    className,
  );

  return (
    <Component
      {...(asChild ? {} : { type: "button" as const })}
      {...props}
      disabled={isDisabled}
      aria-busy={isLoading ? true : undefined}
      className={classes}
    >
      {asChild ? (
        children
      ) : (
        <>
          {isLoading ? (
            <CircleNotchIcon className={cn("animate-spin")} size={16} />
          ) : leftIcon ? (
            <span aria-hidden>{leftIcon}</span>
          ) : null}
          {children}
          {!isLoading && rightIcon ? <span aria-hidden>{rightIcon}</span> : null}
        </>
      )}
    </Component>
  );
}
