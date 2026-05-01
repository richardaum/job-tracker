import { cn } from "@ui/lib/cn";
import React from "react";

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function FilterChip({
  active = false,
  className,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-0",
        active
          ? "border-border-brand bg-bg-brand text-text-inverted"
          : "border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-surface-hover",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
