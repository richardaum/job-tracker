import React from "react";
import { cn } from "@ui/lib/cn";

type Direction = "row" | "column";
type Gap = "xs" | "sm" | "md" | "lg";
type Align = "start" | "center" | "end" | "stretch";
type Justify = "start" | "center" | "end" | "between";

export interface StackProps {
  children: React.ReactNode;
  direction?: Direction;
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  className?: string;
}

const directionClasses: Record<Direction, string> = {
  row: "flex-row",
  column: "flex-col",
};

const gapClasses: Record<Gap, string> = {
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

const alignClasses: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyClasses: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export function Stack({
  children,
  direction = "column",
  gap = "md",
  align = "stretch",
  justify = "start",
  className,
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction],
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className,
      )}
    >
      {children}
    </div>
  );
}
