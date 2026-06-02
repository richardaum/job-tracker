"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "../../lib/cn";
import { Tooltip } from "../Tooltip/Tooltip";

export interface TruncateTextProps {
  children: string;
  className?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

export function TruncateText({ children, className, tooltipSide = "top" }: TruncateTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setIsTruncated(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
  }, [children]);

  const trigger = (
    <span ref={ref} className={cn("truncate", className)}>
      {children}
    </span>
  );

  return (
    <Tooltip content={children} side={tooltipSide} enabled={isTruncated}>
      {trigger}
    </Tooltip>
  );
}
