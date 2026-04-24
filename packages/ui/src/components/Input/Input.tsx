import React from "react";
import { cn } from "@ui/lib/cn";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  size?: "sm" | "md";
  state?: "default" | "error";
  ref?: React.Ref<HTMLInputElement>;
}

const sizeClasses: Record<NonNullable<InputProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-base",
};

const stateClasses: Record<NonNullable<InputProps["state"]>, string> = {
  default:
    "border-border-default focus-visible:border-border-brand focus-visible:ring-border-brand",
  error:
    "border-border-error text-text-error focus-visible:border-border-error focus-visible:ring-border-error",
};

export function Input({
  size = "md",
  state = "default",
  className,
  ref,
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      ref={ref}
      className={cn(
        `w-full rounded-md border bg-bg-surface text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-bg-surface-hover ${sizeClasses[size]} ${stateClasses[state]} ${className ?? ""}`,
      )}
    />
  );
}
