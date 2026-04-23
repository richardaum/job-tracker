import React from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { IconButton, Text, cn } from "@job-tracker/ui";

type FieldEditTriggerButtonProps = Omit<
  React.ComponentProps<typeof IconButton>,
  "icon" | "intent" | "size"
> & {
  label: string;
};

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
      icon={<PencilSimpleIcon size={14} weight="regular" />}
      className={cn(
        "h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export function HoverEditableFieldRow({
  label,
  content,
  editControl,
}: {
  label: string;
  content: React.ReactNode;
  editControl: React.ReactNode;
}) {
  return (
    <div className={cn("group")}>
      <div className={cn("inline-flex items-center gap-1")}>
        <Text size="xs" color="muted">
          {label}
        </Text>
        <div className={cn("shrink-0")}>{editControl}</div>
      </div>
      <div className={cn("mt-1 min-w-0")}>{content}</div>
    </div>
  );
}
