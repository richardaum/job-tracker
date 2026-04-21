import React from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  content,
  children,
  side = "top",
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={0}>
      <RadixTooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            className="z-50 rounded-sm border border-border-subtle bg-bg-surface p-inline-gap text-sm text-text-secondary shadow-sm"
          >
            {content}
            <RadixTooltip.Arrow className="fill-bg-surface" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
