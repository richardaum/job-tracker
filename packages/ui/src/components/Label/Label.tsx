import type { ReactNode } from "react";
import { cn } from "@ui/lib/cn";

export interface LabelProps {
  children: ReactNode;
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
      className={cn(
        `inline-flex items-center gap-0.5 font-medium ${sizeClasses[size]} ${stateClasses[state]}`,
        htmlFor && "cursor-pointer",
      )}
    >
      <span>{children}</span>
      {required ? (
        <span aria-hidden="true" className={cn("text-text-error")}>
          *
        </span>
      ) : null}
    </label>
  );
}
