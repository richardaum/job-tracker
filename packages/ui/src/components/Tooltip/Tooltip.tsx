import * as RadixTooltip from "@radix-ui/react-tooltip";
import { useRef, useLayoutEffect, useState, type ReactNode, type ReactElement } from "react";

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  enabled?: boolean;
}

const ARROW_OFFSET = 5;
const ARROW_WIDTH = 10;
const CORNER_RADIUS = 4;
const PAD_X = 8;
const PAD_Y = 6;

function buildShapePath(bodyWidth: number, bodyHeight: number, side: string): string {
  const halfArrow = ARROW_WIDTH / 2;
  const centerX = bodyWidth / 2;
  const centerY = bodyHeight / 2;

  switch (side) {
    case "top":
      return [
        `M ${centerX} ${bodyHeight + ARROW_OFFSET}`,
        `L ${centerX + halfArrow} ${bodyHeight}`,
        `L ${bodyWidth - CORNER_RADIUS} ${bodyHeight}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${bodyWidth} ${bodyHeight - CORNER_RADIUS}`,
        `L ${bodyWidth} ${CORNER_RADIUS}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${bodyWidth - CORNER_RADIUS} 0`,
        `L ${CORNER_RADIUS} 0`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 0 ${CORNER_RADIUS}`,
        `L 0 ${bodyHeight - CORNER_RADIUS}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${CORNER_RADIUS} ${bodyHeight}`,
        `L ${centerX - halfArrow} ${bodyHeight}`,
        `Z`,
      ].join(" ");
    case "bottom":
      return [
        `M ${centerX} 0`,
        `L ${centerX + halfArrow} ${ARROW_OFFSET}`,
        `L ${bodyWidth} ${ARROW_OFFSET}`,
        `L ${bodyWidth} ${bodyHeight + ARROW_OFFSET - CORNER_RADIUS}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${bodyWidth - CORNER_RADIUS} ${bodyHeight + ARROW_OFFSET}`,
        `L ${CORNER_RADIUS} ${bodyHeight + ARROW_OFFSET}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 0 ${bodyHeight + ARROW_OFFSET - CORNER_RADIUS}`,
        `L 0 ${ARROW_OFFSET}`,
        `L ${centerX - halfArrow} ${ARROW_OFFSET}`,
        `Z`,
      ].join(" ");
    case "right":
      return [
        `M ${-ARROW_OFFSET} ${centerY}`,
        `L 0 ${centerY - halfArrow}`,
        `L 0 ${CORNER_RADIUS}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${CORNER_RADIUS} 0`,
        `L ${bodyWidth - CORNER_RADIUS} 0`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${bodyWidth} ${CORNER_RADIUS}`,
        `L ${bodyWidth} ${bodyHeight - CORNER_RADIUS}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${bodyWidth - CORNER_RADIUS} ${bodyHeight}`,
        `L ${CORNER_RADIUS} ${bodyHeight}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 0 ${bodyHeight - CORNER_RADIUS}`,
        `L 0 ${centerY + halfArrow}`,
        `Z`,
      ].join(" ");
    case "left":
      return [
        `M ${bodyWidth + ARROW_OFFSET} ${centerY}`,
        `L ${bodyWidth} ${centerY + halfArrow}`,
        `L ${bodyWidth} ${bodyHeight - CORNER_RADIUS}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${bodyWidth - CORNER_RADIUS} ${bodyHeight}`,
        `L ${CORNER_RADIUS} ${bodyHeight}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 0 ${bodyHeight - CORNER_RADIUS}`,
        `L 0 ${CORNER_RADIUS}`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${CORNER_RADIUS} 0`,
        `L ${bodyWidth - CORNER_RADIUS} 0`,
        `A ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 0 ${bodyWidth} ${CORNER_RADIUS}`,
        `L ${bodyWidth} ${centerY - halfArrow}`,
        `Z`,
      ].join(" ");
  }
  return "";
}

function getViewBox(side: string, bodyWidth: number, bodyHeight: number) {
  switch (side) {
    case "top":
    case "bottom":
      return { x: 0, y: 0, width: bodyWidth, height: bodyHeight + ARROW_OFFSET };
    case "right":
      return { x: -ARROW_OFFSET, y: 0, width: bodyWidth + ARROW_OFFSET, height: bodyHeight };
    case "left":
      return { x: 0, y: 0, width: bodyWidth + ARROW_OFFSET, height: bodyHeight };
  }
  return { x: 0, y: 0, width: bodyWidth, height: bodyHeight };
}

type UnifiedTooltipContentProps = { content: ReactNode; side: string };

function UnifiedTooltipContent({ content, side }: UnifiedTooltipContentProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const text = textRef.current;
    if (!text) return;
    const rect = text.getBoundingClientRect();
    const bodyWidth = Math.ceil(rect.width);
    const bodyHeight = Math.ceil(rect.height);
    const dimensions = getViewBox(side, bodyWidth, bodyHeight);

    const path = pathRef.current;
    if (path) {
      path.setAttribute("d", buildShapePath(bodyWidth, bodyHeight, side));
    }

    const svg = path?.closest("svg");
    if (svg) {
      svg.setAttribute("viewBox", `${dimensions.x} ${dimensions.y} ${dimensions.width} ${dimensions.height}`);
      svg.setAttribute("width", String(dimensions.width));
      svg.setAttribute("height", String(dimensions.height));
    }

    setReady(true);
  }, [content, side]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          overflow: "visible",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.15s",
          filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.3))",
        }}
      >
        <path ref={pathRef} fill="var(--color-tooltip)" stroke="white" strokeWidth={2} strokeLinejoin="round" />
      </svg>
      <div
        ref={textRef}
        className="text-xs text-text-inverted"
        style={{
          padding: `${PAD_Y}px ${PAD_X}px`,
          visibility: ready ? "visible" : "hidden",
          whiteSpace: "nowrap",
          position: "relative",
          zIndex: 1,
        }}
      >
        {content}
      </div>
    </div>
  );
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
          <RadixTooltip.Content side={side} align={align} sideOffset={6} className="z-50">
            <UnifiedTooltipContent content={content} side={side} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
