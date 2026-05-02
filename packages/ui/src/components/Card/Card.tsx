import { cn } from "@ui/lib/cn";
import React from "react";

export interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "outlined";
  padding?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
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
  "2xl": "px-8 py-6",
  "3xl": "px-10 py-8",
  "4xl": "px-12 py-10",
  "5xl": "px-14 py-12",
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
