import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cn } from "@ui/lib/cn";
import React from "react";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  /** Radix: along which edge of the trigger the content is anchored when `side` is top/bottom (start = left in LTR). */
  align?: "start" | "center" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether the tooltip is active. If `false`, the tooltip will not be rendered and children will be returned directly. Defaults to `true`. */
  enabled?: boolean;
}

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  open,
  defaultOpen,
  onOpenChange,
  enabled = true,
}: TooltipProps) {
  if (!enabled) {
    return children;
  }

  return (
    <RadixTooltip.Provider delayDuration={0}>
      <RadixTooltip.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(nextOpen) => {
          onOpenChange?.(nextOpen);
        }}
      >
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={6}
            className={cn(
              "z-50 rounded-sm border-2 border-white bg-tooltip px-2 py-1.5 text-xs text-text-inverted shadow-sm",
            )}
          >
            {content}
            <RadixTooltip.Arrow className={cn("fill-tooltip")} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
