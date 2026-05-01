import * as RadixPopover from "@radix-ui/react-popover";
import { cn } from "@ui/lib/cn";
import React from "react";

export interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  enabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({
  trigger,
  children,
  align = "end",
  sideOffset = 6,
  enabled = true,
  open,
  onOpenChange,
}: PopoverProps) {
  if (!enabled) {
    return trigger;
  }

  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 min-w-44 rounded-md border border-border-subtle bg-bg-surface p-2 shadow-md",
          )}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
