import React from "react";

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> {
  size?: "sm" | "md";
  state?: "default" | "error";
}

const sizeClasses: Record<NonNullable<TextareaProps["size"]>, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
};

const stateClasses: Record<NonNullable<TextareaProps["state"]>, string> = {
  default:
    "border-border-default focus-visible:border-border-brand focus-visible:ring-border-brand",
  error:
    "border-border-error text-text-error focus-visible:border-border-error focus-visible:ring-border-error",
};

export function Textarea({
  size = "md",
  state = "default",
  className,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={`w-full rounded-md border bg-bg-surface text-text-primary shadow-sm transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-bg-canvas ${sizeClasses[size]} ${stateClasses[state]} ${className ?? ""}`}
    />
  );
}
