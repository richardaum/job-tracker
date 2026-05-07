import { cn, IconButton } from "@job-tracker/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import React from "react";

type FieldEditTriggerButtonProps = Omit<
  React.ComponentProps<typeof IconButton>,
  "icon" | "intent" | "size" | "tooltip"
> & { label: string };

export function FieldEditTriggerButton({
  label,
  className,
  ...props
}: FieldEditTriggerButtonProps) {
  return (
    <IconButton
      intent="ghost"
      size="sm"
      label={label}
      tooltip={label}
      icon={<PencilSimpleIcon size={14} weight="regular" />}
      className={cn(
        "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
        className,
      )}
      {...props}
    />
  );
}
