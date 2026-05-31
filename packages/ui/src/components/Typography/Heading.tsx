import type { HTMLAttributes } from "react";
import { cn } from "@ui/lib/cn";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingSize = "4xl" | "3xl" | "2xl" | "xl" | "lg" | "base";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingSize;
}

const sizeClasses: Record<HeadingSize, string> = {
  "4xl": "text-4xl font-bold leading-tight",
  "3xl": "text-3xl font-bold leading-tight",
  "2xl": "text-2xl font-semibold leading-snug",
  xl: "text-xl font-semibold leading-snug",
  lg: "text-lg font-medium leading-snug",
  base: "text-base font-medium leading-normal",
};

const defaultSizeByLevel: Record<HeadingLevel, HeadingSize> = {
  h1: "4xl",
  h2: "3xl",
  h3: "2xl",
  h4: "xl",
  h5: "lg",
  h6: "base",
};

export function Heading({
  as: Tag = "h2",
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  const resolvedSize = size ?? defaultSizeByLevel[Tag];
  return (
    <Tag
      className={cn("text-text-primary", sizeClasses[resolvedSize], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
