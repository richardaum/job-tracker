import React from "react";

export interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  size?: "sm" | "md";
  state?: "default" | "error";
  required?: boolean;
}

const sizeClasses: Record<NonNullable<LabelProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-base",
};

const stateClasses: Record<NonNullable<LabelProps["state"]>, string> = {
  default: "text-text-secondary",
  error: "text-text-error",
};

export function Label({
  children,
  htmlFor,
  size = "md",
  state = "default",
  required = false,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`inline-flex items-center gap-inline-gap font-medium ${sizeClasses[size]} ${stateClasses[state]}`}
    >
      <span>{children}</span>
      {required ? (
        <span aria-hidden="true" className="text-text-error">
          *
        </span>
      ) : null}
    </label>
  );
}
