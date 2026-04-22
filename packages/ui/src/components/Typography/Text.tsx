import React from "react";

export type TextSize = "xs" | "sm" | "base" | "md" | "lg";
export type TextWeight = "regular" | "medium" | "semibold" | "bold";
export type TextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "brand"
  | "error"
  | "success";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "label" | "div";
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
}

const sizeClasses: Record<TextSize, string> = {
  xs: "text-xs leading-normal",
  sm: "text-sm leading-normal",
  base: "text-base leading-normal",
  md: "text-md leading-normal",
  lg: "text-lg leading-normal",
};

const weightClasses: Record<TextWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorClasses: Record<TextColor, string> = {
  primary: "text-text-primary",
  secondary: "text-text-secondary",
  muted: "text-text-muted",
  brand: "text-text-brand",
  error: "text-text-error",
  success: "text-text-success",
};

export function Text({
  as: Tag = "p",
  size = "base",
  weight = "regular",
  color = "primary",
  className = "",
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={`${sizeClasses[size]} ${weightClasses[weight]} ${colorClasses[color]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
