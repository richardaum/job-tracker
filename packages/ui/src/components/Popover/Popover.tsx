import React from "react";
import * as RadixPopover from "@radix-ui/react-popover";
import { cn } from "@ui/lib/cn";

export interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export function Popover({
  trigger,
  children,
  align = "end",
  sideOffset = 6,
}: PopoverProps) {
  return (
    <RadixPopover.Root>
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
