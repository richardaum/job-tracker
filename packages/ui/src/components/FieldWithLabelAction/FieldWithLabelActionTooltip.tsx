import { Tooltip, TooltipProps } from "@ui/components/Tooltip/Tooltip";

export type FieldWithLabelActionTooltipProps = TooltipProps;

export function FieldWithLabelActionTooltip({ side = "bottom", ...props }: FieldWithLabelActionTooltipProps) {
  return <Tooltip side={side} {...props} />;
}
