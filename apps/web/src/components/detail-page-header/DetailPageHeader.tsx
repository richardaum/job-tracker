"use client";

import { cn, Heading, Text } from "@job-tracker/ui";
import type { ReactNode } from "react";

const DEFAULT_STACK = "gap-2";
const DEFAULT_RESERVE = "pe-36 sm:pe-44";

export interface DetailPageHeaderProps {
  children: ReactNode;
  trailing?: ReactNode | undefined;
  stackClassName?: string;
  className?: string;
  trailingOffsetClassName?: string;
}

function DetailPageHeader({
  children,
  trailing,
  stackClassName = DEFAULT_STACK,
  className,
  trailingOffsetClassName = DEFAULT_RESERVE,
}: DetailPageHeaderProps) {
  const hasTrailing = trailing != null;

  return (
    <div className={cn("relative isolate border-b border-border-subtle p-4 sm:px-6 sm:py-5", className)}>
      {hasTrailing ? (
        <div className={cn("pointer-events-none absolute inset-e-4 top-4 z-1 sm:inset-e-6 sm:top-5")}>
          <div className={cn("pointer-events-auto flex shrink-0 items-start justify-end gap-2")}>{trailing}</div>
        </div>
      ) : null}
      <div className={cn("flex flex-col", stackClassName, hasTrailing ? trailingOffsetClassName : undefined)}>
        {children}
      </div>
    </div>
  );
}

type TitleProps = { children: ReactNode; className?: string };

function Title({ children, className }: TitleProps) {
  return (
    <Heading as="h1" size="2xl" className={cn("min-w-0", className)}>
      {children}
    </Heading>
  );
}

type DescriptionProps = { children: ReactNode; className?: string };

function Description({ children, className }: DescriptionProps) {
  return (
    <Text as="div" size="sm" color="secondary" className={cn(className)}>
      {children}
    </Text>
  );
}

DetailPageHeader.Title = Title;
DetailPageHeader.Description = Description;
export { DetailPageHeader };
