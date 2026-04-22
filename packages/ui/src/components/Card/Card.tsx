import React from "react";
import { cn } from "@ui/lib/cn";

export interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "outlined";
  padding?: "xs" | "sm" | "md" | "lg" | "xl";
}

const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "border-border-subtle shadow-sm",
  outlined: "border-border-default shadow-none",
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  xs: "px-form-gap py-inline-gap",
  sm: "px-card-gap py-form-gap",
  md: "px-component-gap py-card-gap",
  lg: "px-card-padding py-card-gap",
  xl: "px-card-padding py-component-gap",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
}: CardProps) {
  return (
    <article
      className={cn(
        `rounded-lg border bg-bg-surface ${variantClasses[variant]} ${paddingClasses[padding]}`,
      )}
    >
      {children}
    </article>
  );
}
