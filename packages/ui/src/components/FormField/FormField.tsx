import { Label } from "@ui/components/Label/Label";
import { cn } from "@ui/lib/cn";
import React from "react";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: "sm" | "md";
  tooltip?: React.ReactNode;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  size = "md",
  tooltip,
  children,
}: FormFieldProps) {
  const state = error ? "error" : "default";

  return (
    <div className={cn("flex w-full flex-col gap-2")}>
      <div className={cn("inline-flex items-center gap-1")}>
        <Label htmlFor={htmlFor} required={required} size={size} state={state}>
          {label}
        </Label>
        {tooltip && <span className={cn("inline-flex")}>{tooltip}</span>}
      </div>
      {children}
      {error ? (
        <p className={cn("text-sm text-text-error")} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={cn("text-sm text-text-muted")}>{hint}</p>
      ) : null}
    </div>
  );
}
