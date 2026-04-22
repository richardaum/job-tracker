import React from "react";
import { cn } from "@ui/lib/cn";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  label?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-7 border-[3px]",
};

export function Spinner({
  size = "md",
  label = "Loading",
  className,
  ...props
}: SpinnerProps) {
  const classes = cn(
    "inline-block animate-spin rounded-full border-bg-surface border-t-border-brand",
    sizeClasses[size],
    className,
  );

  return (
    <span role="status" aria-label={label} className={classes} {...props} />
  );
}
