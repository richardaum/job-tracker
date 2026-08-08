import type { ComponentProps } from "react";
import { IconButton } from "@ui/components/IconButton/IconButton";
import { cn } from "@ui/lib/cn";

export type FieldWithLabelActionIconActionButtonProps = Omit<
  ComponentProps<typeof IconButton>,
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
        "size-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 disabled:opacity-0 group-hover:disabled:opacity-100 group-focus-within:disabled:opacity-100",
        className,
      )}
      {...props}
    />
  );
}
