"use client";

import { cn, Skeleton } from "@job-tracker/ui";
import { useEffect, useRef, useState } from "react";

export function ChatPanelSkeleton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentBoxSize[0]?.inlineSize ?? entry.contentRect.width;
        setIsNarrow(width < 480);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isNarrow) {
    return (
      <div ref={containerRef} className={cn("flex h-full min-h-0 flex-col gap-2 p-3")}>
        <Skeleton variant="text" className={cn("h-8 w-full max-w-32")} />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="text" className={cn("h-5 w-full")} />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("flex h-full min-h-0")}>
      <div className={cn("flex w-48 flex-col gap-2 border-r border-border-subtle p-3")}>
        <Skeleton variant="text" className={cn("h-8 w-full")} />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="text" className={cn("h-5 w-full")} />
        ))}
      </div>
      <div className={cn("flex flex-1 items-center justify-center p-3")}>
        <Skeleton variant="text" className={cn("h-4 w-48")} />
      </div>
    </div>
  );
}
