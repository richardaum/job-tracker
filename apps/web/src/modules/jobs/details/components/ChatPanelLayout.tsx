"use client";

import { cn } from "@job-tracker/ui";
import { type ReactNode, useEffect, useRef, useState } from "react";

type ChatPanelLayoutProps = {
  sidebar: ReactNode;
  main: ReactNode;
  showSidebar: boolean;
  sidebarHeader?: ReactNode;
  onIsNarrowChange?: (isNarrow: boolean) => void;
};

export function ChatPanelLayout({ sidebar, main, showSidebar, sidebarHeader, onIsNarrowChange }: ChatPanelLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentBoxSize[0]?.inlineSize ?? entry.contentRect.width;
        const narrow = width < 480;
        setIsNarrow(narrow);
        onIsNarrowChange?.(narrow);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIsNarrowChange]);

  if (isNarrow) {
    return (
      <div ref={containerRef} className={cn("flex h-full min-h-0 flex-col")}>
        {sidebarHeader}
        {showSidebar ? sidebar : main}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("flex h-full min-h-0")}>
      <div className={cn("flex min-h-0 flex-col shrink-0 w-48 border-r border-border-subtle")}>
        {sidebarHeader}
        {sidebar}
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col")}>{main}</div>
    </div>
  );
}
