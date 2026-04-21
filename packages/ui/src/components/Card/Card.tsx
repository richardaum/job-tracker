import React from "react";

export interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "outlined";
  padding?: "sm" | "md";
}

const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "border-border-subtle shadow-sm",
  outlined: "border-border-default shadow-none",
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  sm: "p-inline-gap",
  md: "p-card-padding",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
}: CardProps) {
  return (
    <article
      className={`rounded-lg border bg-bg-surface ${variantClasses[variant]} ${paddingClasses[padding]}`}
    >
      {children}
    </article>
  );
}
