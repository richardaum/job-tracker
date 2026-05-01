import { cn } from "@ui/lib/cn";
import React from "react";

export type SkeletonVariant = "text" | "rect" | "circle";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded-sm",
  rect: "h-24 w-full rounded-md",
  circle: "size-10 rounded-full",
};

export function Skeleton({
  variant = "rect",
  className,
  ...props
}: SkeletonProps) {
  const classes = cn(
    "animate-pulse bg-bg-surface-hover",
    variantClasses[variant],
    className,
  );

  return <div aria-hidden className={classes} {...props} />;
}
