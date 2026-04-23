import React from "react";
import { cn } from "@ui/lib/cn";

export interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "outlined";
  padding?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "border-border-subtle shadow-none",
  outlined: "border-border-default shadow-none",
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  xs: "px-3 py-2",
  sm: "px-4 py-3",
  md: "px-5 py-4",
  lg: "px-6 py-4",
  xl: "px-6 py-5",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className,
}: CardProps) {
  return (
    <article
      className={cn(
        `rounded-lg border bg-bg-surface ${variantClasses[variant]} ${paddingClasses[padding]}`,
        className,
      )}
    >
      {children}
    </article>
  );
}
