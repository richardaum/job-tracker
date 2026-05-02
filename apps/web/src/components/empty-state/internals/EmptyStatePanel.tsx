"use client";

import { Text, type TextProps } from "@job-tracker/ui";

export type EmptyStatePanelProps = {
  message: string;
  size?: TextProps["size"];
  color?: Extract<TextProps["color"], "muted" | "secondary">;
};

export function EmptyStatePanel({
  message,
  size = "sm",
  color = "muted",
}: EmptyStatePanelProps) {
  return (
    <Text size={size} color={color}>
      {message}
    </Text>
  );
}
