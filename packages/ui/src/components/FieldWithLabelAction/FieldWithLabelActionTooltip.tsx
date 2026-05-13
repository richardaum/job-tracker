import { Tooltip, TooltipProps } from "@ui/components/Tooltip/Tooltip";
import React from "react";

export type FieldWithLabelActionTooltipProps = TooltipProps;

export function FieldWithLabelActionTooltip({
  side = "bottom",
  ...props
}: FieldWithLabelActionTooltipProps) {
  return <Tooltip side={side} {...props} />;
}
