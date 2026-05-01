import { cn } from "@ui/lib/cn";
import React from "react";

import { Label } from "../Label/Label";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  size = "md",
  children,
}: FormFieldProps) {
  const state = error ? "error" : "default";

  return (
    <div className={cn("flex w-full flex-col gap-2")}>
      <Label htmlFor={htmlFor} required={required} size={size} state={state}>
        {label}
      </Label>
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
