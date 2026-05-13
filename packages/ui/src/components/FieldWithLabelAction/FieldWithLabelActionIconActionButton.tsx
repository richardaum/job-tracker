import { IconButton } from "@ui/components/IconButton/IconButton";
import { cn } from "@ui/lib/cn";
import React from "react";

export type FieldWithLabelActionIconActionButtonProps = Omit<
  React.ComponentProps<typeof IconButton>,
  "intent" | "size" | "tooltip"
> & { label: string };

export function FieldWithLabelActionIconActionButton({
  label,
  className,
  ...props
}: FieldWithLabelActionIconActionButtonProps) {
  return (
    <IconButton
      intent="ghost"
      size="sm"
      label={label}
      tooltip={label}
      className={cn(
        "size-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
        className,
      )}
      {...props}
    />
  );
}
