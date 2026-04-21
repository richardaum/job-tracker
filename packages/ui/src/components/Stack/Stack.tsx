import React from "react";

type Direction = "row" | "column";
type Gap = "inline" | "form" | "card" | "section";
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
  inline: "gap-inline-gap",
  form: "gap-form-gap",
  card: "gap-card-gap",
  section: "gap-section-gap",
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
  gap = "card",
  align = "stretch",
  justify = "start",
  className,
}: StackProps) {
  return (
    <div
      className={`flex ${directionClasses[direction]} ${gapClasses[gap]} ${alignClasses[align]} ${justifyClasses[justify]}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
