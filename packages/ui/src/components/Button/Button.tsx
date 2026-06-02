"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@ui/lib/cn";

export type ButtonIntent = "primary" | "secondary" | "ghost" | "outlined" | "destructive";
export type ButtonSize = "xs" | "sm" | "md" | "lg";
export type ButtonState = "default" | "loading";
export type ButtonScheme = "brand" | "error" | "success" | "warning";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  intent?: ButtonIntent;
  size?: ButtonSize;
  state?: ButtonState;
  colorScheme?: ButtonScheme;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

const defaultScheme: Record<ButtonIntent, ButtonScheme> = {
  primary: "brand",
  secondary: "brand",
  ghost: "brand",
  outlined: "brand",
  destructive: "error",
};

function resolveIntentClasses(intent: ButtonIntent, scheme: ButtonScheme): string {
  switch (intent) {
    case "primary":
      return `border-transparent bg-bg-${scheme} text-text-inverted hover:bg-bg-${scheme}-hover`;
    case "ghost":
      return `border-transparent bg-transparent text-text-${scheme} shadow-none hover:bg-bg-${scheme}-subtle`;
    case "destructive":
      return `border-border-${scheme} bg-bg-${scheme}-subtle text-text-${scheme} hover:bg-bg-surface`;
    case "secondary":
      return "border-[1.5px] border-border-default bg-bg-surface text-text-primary shadow-none hover:bg-bg-surface-hover";
    case "outlined":
      return "border-border-default bg-transparent text-text-primary shadow-none hover:bg-bg-surface-hover";
  }
}

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
  colorScheme,
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
  const scheme = colorScheme ?? defaultScheme[intent];
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
    resolveIntentClasses(intent, scheme),
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
